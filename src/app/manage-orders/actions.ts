
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, where, doc, updateDoc, runTransaction, getDoc, limit } from 'firebase/firestore';
import * as z from 'zod';
import type { Customer, SubmittedEnquiry } from '@/types';

const enquirySchema = z.object({
  catalogId: z.string(),
  catalogCode: z.string(),
  catalogTitle: z.string(),
  customerName: z.string().min(1, 'Name is required'),
  customerPhone: z.string().min(1, 'A valid phone number is required'),
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
    const enquiryId = `ENQ-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
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

export async function confirmEnquiry(enquiryId: string) {
    if (!enquiryId) {
        return { success: false, error: 'Invalid Enquiry ID provided.' };
    }
    
    const enquiryRef = doc(db, 'enquiries', enquiryId);
    
    try {
        const enquiryDocSnap = await getDoc(enquiryRef);
        if (!enquiryDocSnap.exists()) {
            throw new Error("Enquiry not found.");
        }

        const enquiry = { id: enquiryDocSnap.id, ...enquiryDocSnap.data() } as SubmittedEnquiry;
        if (!enquiry || !enquiry.customerEmail || !enquiry.submittedBy || !enquiry.submittedBy.id || !enquiry.id) {
            throw new Error('Invalid or incomplete enquiry data. Cannot proceed.');
        }

        if (enquiry.status !== 'New') {
            return { success: true, message: "Enquiry already processed." };
        }

        const customersRef = collection(db, 'customers');
        const customerQuery = query(customersRef, where("email", "==", enquiry.customerEmail), limit(1));
        const existingCustomers = await getDocs(customerQuery);
        
        await runTransaction(db, async (transaction) => {
            const freshEnquiryDoc = await transaction.get(enquiryRef);
            if (!freshEnquiryDoc.exists()) {
                throw new Error("Enquiry not found inside transaction.");
            }
            const freshEnquiryData = freshEnquiryDoc.data() as SubmittedEnquiry;
            if (freshEnquiryData.status !== 'New') {
                console.log("Enquiry was processed by another request.");
                return;
            }

            if (existingCustomers.empty) {
                const customerId = `CD${crypto.randomUUID().substring(0, 10).toUpperCase()}`;
                const newCustomer: Omit<Customer, 'id'> = {
                    customerId: customerId,
                    name: enquiry.customerName,
                    email: enquiry.customerEmail,
                    phone: enquiry.customerPhone,
                    pincode: enquiry.customerPincode,
                    createdBy: enquiry.submittedBy.id,
                    createdAt: new Date().toISOString(),
                };
                const newCustomerRef = doc(collection(db, 'customers'));
                transaction.set(newCustomerRef, newCustomer);
            }

            transaction.update(enquiryRef, { status: 'Contacted' });
        });

        return { success: true, message: 'Enquiry confirmed and customer created.' };
    } catch (error) {
        console.error('Error confirming enquiry:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return { success: false, error: errorMessage };
    }
}
