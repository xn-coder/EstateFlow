'use server';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, getDoc, writeBatch, updateDoc, addDoc, query, limit, setDoc, where } from 'firebase/firestore';
import type { Payable, PaymentHistory, Receivable, User, WalletSummary } from '@/types';
import { initialPayables, initialPaymentHistory, initialReceivables } from '@/lib/data';
import * as z from 'zod';
import bcrypt from 'bcryptjs';

const receivablesRef = collection(db, 'receivables');
const payablesRef = collection(db, 'payables');
const paymentHistoryRef = collection(db, 'paymentHistory');
const walletSummaryRef = doc(db, 'wallet', 'summary');

// --- Seeding Actions ---
async function seedCollection(ref: any, initialData: any[]) {
    const snapshot = await getDocs(query(ref, limit(1)));
    if (snapshot.empty) {
        console.log(`Seeding ${ref.path}...`);
        const batch = writeBatch(db);
        initialData.forEach(item => {
            const { id, ...data } = item;
            const docRef = doc(ref, id);
            batch.set(docRef, data);
        });
        await batch.commit();
        console.log(`Seeded ${initialData.length} documents into ${ref.path}.`);
    }
}

async function initializeWalletSummary() {
    const docSnap = await getDoc(walletSummaryRef);
    if (!docSnap.exists()) {
        console.log('Initializing wallet summary...');
        await setDoc(walletSummaryRef, {
            totalBalance: 100,
            revenue: 1000,
        });
        console.log('Wallet summary initialized.');
    }
}

// --- Data Fetching Actions ---

export async function getWalletSummaryData(): Promise<WalletSummary> {
    try {
        await initializeWalletSummary(); // Ensure summary doc exists
        await seedCollection(payablesRef, initialPayables);
        await seedCollection(receivablesRef, initialReceivables);

        const payablesQuery = query(collection(db, 'payables'), where('status', '==', 'Pending'));
        const receivablesQuery = query(collection(db, 'receivables'), where('status', '==', 'Pending'));

        const [summarySnap, payablesSnap, receivablesSnap] = await Promise.all([
            getDoc(walletSummaryRef),
            getDocs(payablesQuery),
            getDocs(receivablesQuery),
        ]);

        const summaryData = summarySnap.data() as { totalBalance: number; revenue: number };
        
        const totalPayable = payablesSnap.docs.reduce((sum, doc) => sum + doc.data().payableAmount, 0);
        const totalReceivable = receivablesSnap.docs.reduce((sum, doc) => sum + doc.data().pendingAmount, 0);

        return {
            totalBalance: summaryData.totalBalance,
            revenue: summaryData.revenue,
            payable: totalPayable,
            receivable: totalReceivable,
        };
    } catch (error) {
        console.error("Error fetching wallet summary data:", error);
        return { totalBalance: 0, revenue: 0, payable: 0, receivable: 0 };
    }
}

export async function getReceivables(): Promise<Receivable[]> {
  await seedCollection(receivablesRef, initialReceivables);
  const snapshot = await getDocs(receivablesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receivable));
}

export async function getPayables(): Promise<Payable[]> {
  await seedCollection(payablesRef, initialPayables);
  const snapshot = await getDocs(payablesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payable));
}

export async function getPaymentHistory(): Promise<PaymentHistory[]> {
  await seedCollection(paymentHistoryRef, initialPaymentHistory);
  const snapshot = await getDocs(paymentHistoryRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentHistory));
}

// --- Data Update Actions ---

export async function updateReceivableStatus(id: string, status: 'Pending' | 'Received') {
  try {
    const docRef = doc(db, 'receivables', id);
    await updateDoc(docRef, { status });
    return { success: true };
  } catch (error) {
    console.error("Error updating receivable status:", error);
    return { success: false, error: "Failed to update status." };
  }
}

export async function updatePayableStatus(id: string, status: 'Pending' | 'Paid') {
  try {
    const docRef = doc(db, 'payables', id);
    await updateDoc(docRef, { status });
    return { success: true };
  } catch (error) {
    console.error("Error updating payable status:", error);
    return { success: false, error: "Failed to update status." };
  }
}

// --- Manage Wallet Transaction ---

const manageWalletSchema = z.object({
  action: z.enum(["Topup wallet", "send a partner", "send a customer"]),
  amount: z.coerce.number().min(1),
  paymentMethod: z.string(),
  password: z.string().min(1),
  userId: z.string().min(1),
});

export async function manageWalletTransaction(data: z.infer<typeof manageWalletSchema>) {
  const validation = manageWalletSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { action, amount, paymentMethod, password, userId } = validation.data;

  try {
    // 1. Verify admin password
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found.' };
    }
    const user = userDoc.data() as User & { passwordHash: string };
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, error: 'Incorrect admin password.' };
    }
    
    // 2. Perform transaction logic
    const summaryDoc = await getDoc(walletSummaryRef);
    const summaryData = summaryDoc.data() as { totalBalance: number; revenue: number };
    const newHistory: Omit<PaymentHistory, 'id'> = {
        date: new Date().toISOString().split('T')[0],
        name: action,
        transactionId: `TXN${Date.now()}`,
        amount,
        paymentMethod,
        type: 'Credit', // Default
    };

    if (action === 'Topup wallet') {
        newHistory.type = 'Credit';
        await updateDoc(walletSummaryRef, { 
            totalBalance: summaryData.totalBalance + amount,
            revenue: summaryData.revenue + amount,
         });
    } else { // send a partner / send a customer
        newHistory.type = 'Debit';
        if (summaryData.totalBalance < amount) {
            return { success: false, error: 'Insufficient wallet balance.' };
        }
        await updateDoc(walletSummaryRef, { totalBalance: summaryData.totalBalance - amount });
    }
    
    // 3. Add to payment history
    await addDoc(paymentHistoryRef, newHistory);

    return { success: true, message: `Transaction '${action}' of ${amount} INR was successful.` };

  } catch (error) {
    console.error('Wallet transaction error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
