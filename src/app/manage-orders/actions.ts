
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, where, doc, updateDoc, runTransaction, getDoc, limit, QueryConstraint } from 'firebase/firestore';
import * as z from 'zod';
import type { Customer, SubmittedEnquiry, Catalog, User, PartnerData, Payable, PaymentHistory, Receivable } from '@/types';

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
    const enquiryId = `ENQ-${Math.random().toString().slice(2, 10)}`;
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

export async function getEnquiries(partnerId?: string): Promise<SubmittedEnquiry[]> {
  try {
    const enquiriesRef = collection(db, 'enquiries');
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    if (partnerId) {
        constraints.push(where('submittedBy.id', '==', partnerId));
    }
    const q = query(enquiriesRef, ...constraints);
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
        // Perform reads outside the transaction where possible
        const enquiryForCustomerCheck = await getDoc(enquiryRef);
        if (!enquiryForCustomerCheck.exists()) {
            throw new Error("Enquiry not found.");
        }
        const enquiryDataForCheck = enquiryForCustomerCheck.data() as SubmittedEnquiry;

        const customersRef = collection(db, 'customers');
        const customerQuery = query(customersRef, where("email", "==", enquiryDataForCheck.customerEmail), limit(1));
        const existingCustomersSnap = await getDocs(customerQuery);

        await runTransaction(db, async (transaction) => {
            // ----- All reads must come before writes -----

            // 1. Read all necessary documents
            const freshEnquiryDoc = await transaction.get(enquiryRef);
            if (!freshEnquiryDoc.exists()) {
                throw new Error("Enquiry not found inside transaction.");
            }
            const enquiry = { id: freshEnquiryDoc.id, ...freshEnquiryDoc.data() } as SubmittedEnquiry;

            // Only process if status is 'New'
            if (enquiry.status !== 'New') {
                return;
            }

            const catalogRef = doc(db, 'catalogs', enquiry.catalogId);
            const catalogDoc = await transaction.get(catalogRef);
            if (!catalogDoc.exists()) throw new Error("Catalog not found.");
            const catalog = { id: catalogDoc.id, ...catalogDoc.data() } as Catalog;

            const partnerUserRef = doc(db, 'users', enquiry.submittedBy.id);
            const partnerUserDoc = await transaction.get(partnerUserRef);
            if (!partnerUserDoc.exists()) throw new Error("Partner user not found.");
            const partnerUser = partnerUserDoc.data() as User;
            if (!partnerUser.partnerProfileId) throw new Error("Partner profile ID not found.");
            
            const partnerProfileRef = doc(db, 'partnerProfiles', partnerUser.partnerProfileId);
            const partnerProfileDoc = await transaction.get(partnerProfileRef);
            if (!partnerProfileDoc.exists()) throw new Error("Partner profile not found.");
            const partnerProfile = partnerProfileDoc.data() as PartnerData;
            
            const walletSummaryRef = doc(db, 'wallet', 'summary');
            const walletSummaryDoc = await transaction.get(walletSummaryRef);

            // ----- All writes happen after reads -----

            // 2. Calculate commission
            let commissionAmount = 0;
            const commissionPercentage = catalog.partnerCategoryCommissions?.[partnerProfile.partnerCategory];

            if (commissionPercentage && commissionPercentage > 0) {
                commissionAmount = (catalog.sellingPrice * commissionPercentage) / 100;
            } else if (catalog.earningType === 'commission') {
                commissionAmount = (catalog.sellingPrice * catalog.earning) / 100;
            } else if (catalog.earningType === 'Fixed rate') {
                commissionAmount = catalog.earning;
            }

            // 3. Write new payable if there's a commission
            if (commissionAmount > 0) {
                const newPayableRef = doc(collection(db, 'payables'));
                const newPayable: Omit<Payable, 'id'> = {
                    date: new Date().toISOString().split('T')[0],
                    recipientName: partnerUser.name,
                    recipientId: partnerUser.partnerCode || partnerUser.id,
                    payableAmount: commissionAmount,
                    status: 'Pending',
                    description: `Commission for '${catalog.title}'`,
                };
                transaction.set(newPayableRef, newPayable);
            }

            // 4. Create a receivable for the full order amount
            const newReceivableRef = doc(collection(db, 'receivables'));
            const newReceivable: Omit<Receivable, 'id'> = {
                date: new Date().toISOString().split('T')[0],
                partnerName: partnerUser.name,
                partnerId: partnerUser.partnerCode || partnerUser.id,
                pendingAmount: catalog.sellingPrice,
                status: 'Pending',
                description: `Sale of '${catalog.title}'`,
            };
            transaction.set(newReceivableRef, newReceivable);
            
            // 5. Update wallet summary (revenue only, not balance)
            if (!walletSummaryDoc.exists()) {
                transaction.set(walletSummaryRef, { totalBalance: 0, revenue: catalog.sellingPrice });
            } else {
                const summaryData = walletSummaryDoc.data();
                transaction.update(walletSummaryRef, {
                    revenue: (summaryData.revenue || 0) + catalog.sellingPrice,
                });
            }
            
            // 6. Write new customer if they don't exist
            if (existingCustomersSnap.empty) {
                const customerId = `CD${Math.random().toString().slice(2, 12)}`;
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

            // 7. Update the enquiry status
            transaction.update(enquiryRef, { status: 'Contacted' });
        });

        return { success: true, message: 'Enquiry confirmed and processed successfully.' };
    } catch (error) {
        console.error('Error confirming enquiry:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return { success: false, error: errorMessage };
    }
}
