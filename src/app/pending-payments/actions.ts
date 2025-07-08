'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, runTransaction } from 'firebase/firestore';
import type { Receivable } from '@/types';
import * as z from 'zod';

export async function getPendingReceivablesForPartner(partnerId: string): Promise<Receivable[]> {
  try {
    const receivablesRef = collection(db, 'receivables');
    // Partners can be identified by user ID (legacy) or partner code.
    const q = query(
        receivablesRef, 
        where('partnerId', '==', partnerId),
        where('status', '==', 'Pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receivable));
  } catch (error) {
    console.error("Error fetching pending receivables for partner:", error);
    return [];
  }
}

const collectPaymentSchema = z.object({
  receivableId: z.string(),
  amountCollected: z.coerce.number().min(0.01, "Amount must be greater than zero."),
});

export async function collectPendingPayment(data: z.infer<typeof collectPaymentSchema>): Promise<{ success: boolean; error?: string }> {
    const validation = collectPaymentSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: 'Invalid data submitted.' };
    }
    
    const { receivableId, amountCollected } = validation.data;
    const receivableRef = doc(db, 'receivables', receivableId);

    try {
        await runTransaction(db, async (transaction) => {
            const receivableDoc = await transaction.get(receivableRef);
            if (!receivableDoc.exists()) {
                throw new Error("Receivable record not found.");
            }
            const receivableData = receivableDoc.data() as Receivable;

            if (receivableData.status !== 'Pending') {
                throw new Error("This payment is not pending.");
            }
            if (amountCollected > receivableData.pendingAmount) {
                throw new Error("Collected amount cannot be greater than the pending amount.");
            }

            const newPendingAmount = receivableData.pendingAmount - amountCollected;
            const newStatus = newPendingAmount <= 0 ? 'Received' : 'Pending';

            transaction.update(receivableRef, {
                pendingAmount: newPendingAmount,
                status: newStatus,
            });
        });
        return { success: true, message: 'Payment collected successfully.' };
    } catch (error) {
        console.error("Error collecting payment:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: errorMessage };
    }
}
