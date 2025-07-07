
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, where, doc, updateDoc, runTransaction } from 'firebase/firestore';
import * as z from 'zod';
import type { Customer, SubmittedEnquiry } from '@/types';

const enquirySchema = z.object({
  catalogId: z.string(),
  catalogCode: z.string(),
  catalogTitle: z.string(),
  customerName: z.string().min(1, 'Name is required'),
  customerPhone: z.string().min(10, 'A valid phone number is required'),
  customerEmail: z.string().email('A valid email is required'),
  customerPincode: z.string().min(1, 'Pincode or City is required'),
  submittedBy: z.object({
      id: z.string(),
      name: z.string(),
      role: z.string(),
  })
});

export async function submitEnquiry(data: Omit<SubmittedEnquiry, 'id' | 'enquiryId' | 'createdAt' | 'status'>) {
  const validation = enquirySchema.safeParse(data);
  if (!validation.success) {
    console.error('Validation errors:', validation.error.flatten());
    return { success: false, error: 'Invalid data submitted. Please check all form fields.' };
  }
  
  try {
    const enquiryId = `ENQ${Math.floor(100000 + Math.random() * 900000)}`;
    const enquiryToSave = {
      ...validation.data,
      enquiryId,
      createdAt: new Date().toISOString(),
      status: 'New' as const,
    };
    
    await addDoc(collection(db, 'enquiries'), enquiryToSave);
    
    return { success: true, message: 'Enquiry submitted successfully!' };
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function getEnquiries(): Promise<SubmittedEnquiry[]> {
  try {
    const enquiriesRef = collection(db, 'enquiries');
    const q = query(enquiriesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SubmittedEnquiry));
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return [];
  }
}

export async function confirmEnquiry(enquiry: SubmittedEnquiry) {
    if (enquiry.status !== 'New') {
        return { success: false, error: 'This enquiry has already been processed.' };
    }

    try {
        await runTransaction(db, async (transaction) => {
            const enquiryRef = doc(db, 'enquiries', enquiry.id);
            const customersRef = collection(db, 'customers');
            
            // 1. Check if customer already exists (by email) to avoid duplicates
            const customerQuery = query(customersRef, where("email", "==", enquiry.customerEmail));
            const existingCustomers = await transaction.get(customerQuery);
            
            if (existingCustomers.empty) {
                // 2. If not, create a new customer
                const customerId = `CUST${Math.floor(100000 + Math.random() * 900000)}`;
                const newCustomer: Omit<Customer, 'id'> = {
                    customerId: customerId,
                    name: enquiry.customerName,
                    email: enquiry.customerEmail,
                    phone: enquiry.customerPhone,
                    pincode: enquiry.customerPincode,
                    createdBy: enquiry.submittedBy.id,
                    createdAt: new Date().toISOString(),
                };
                const newCustomerRef = doc(customersRef);
                transaction.set(newCustomerRef, newCustomer);
            }

            // 3. Update the enquiry status
            transaction.update(enquiryRef, { status: 'Contacted' });
        });

        return { success: true, message: 'Enquiry confirmed and customer created.' };
    } catch (error) {
        console.error('Error confirming enquiry:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return { success: false, error: errorMessage };
    }
}
