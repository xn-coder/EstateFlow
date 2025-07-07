
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, getDoc, writeBatch, updateDoc, addDoc, query, limit, setDoc, where, runTransaction } from 'firebase/firestore';
import type { Payable, PaymentHistory, Receivable, User, WalletSummary } from '@/types';
import * as z from 'zod';
import bcrypt from 'bcryptjs';

const receivablesRef = collection(db, 'receivables');
const payablesRef = collection(db, 'payables');
const paymentHistoryRef = collection(db, 'paymentHistory');
const walletSummaryRef = doc(db, 'wallet', 'summary');

// --- Seeding Actions ---
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
  const snapshot = await getDocs(receivablesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receivable));
}

export async function getPayables(): Promise<Payable[]> {
  const snapshot = await getDocs(payablesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payable));
}

export async function getPaymentHistory(): Promise<PaymentHistory[]> {
  const snapshot = await getDocs(paymentHistoryRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentHistory));
}

// --- Data Update Actions ---

export async function updateReceivableStatus(id: string, status: 'Pending' | 'Received') {
  if (status === 'Pending') {
    // This case is for potential future use (e.g., reversing a transaction)
    // For now, it only updates the status.
    try {
      const docRef = doc(db, 'receivables', id);
      await updateDoc(docRef, { status });
      return { success: true };
    } catch (error) {
      console.error("Error updating receivable status:", error);
      return { success: false, error: "Failed to update status." };
    }
  }

  // Handle 'Received' status with a transaction
  try {
    const receivableRef = doc(db, 'receivables', id);

    await runTransaction(db, async (transaction) => {
      const receivableDoc = await transaction.get(receivableRef);
      if (!receivableDoc.exists()) {
        throw new Error("Receivable document not found!");
      }
      const receivableData = receivableDoc.data() as Receivable;
      
      if (receivableData.status === 'Received') {
          console.log("Receivable already marked as Received.");
          return; // Avoid double-processing
      }
      
      const amount = receivableData.pendingAmount;

      transaction.update(receivableRef, { status: 'Received' });

      const summaryDoc = await transaction.get(walletSummaryRef);
      if (!summaryDoc.exists()) {
          throw new Error("Wallet summary not found!");
      }
      const summaryData = summaryDoc.data() as { totalBalance: number; revenue: number };
      transaction.update(walletSummaryRef, {
        totalBalance: summaryData.totalBalance + amount,
        revenue: summaryData.revenue + amount,
      });
      
      const newHistory: Omit<PaymentHistory, 'id'> = {
        date: new Date().toISOString().split('T')[0],
        name: `Received from ${receivableData.partnerName}`,
        transactionId: `REC-${receivableData.id}`,
        amount,
        paymentMethod: 'System',
        type: 'Credit',
      };
      const newHistoryRef = doc(collection(db, 'paymentHistory'));
      transaction.set(newHistoryRef, newHistory);
    });

    return { success: true };
  } catch (error) {
    console.error("Error receiving payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update status.";
    return { success: false, error: errorMessage };
  }
}

export async function updatePayableStatus(id: string, status: 'Pending' | 'Paid') {
   if (status === 'Pending') {
    try {
      const docRef = doc(db, 'payables', id);
      await updateDoc(docRef, { status });
      return { success: true };
    } catch (error) {
      console.error("Error updating payable status:", error);
      return { success: false, error: "Failed to update status." };
    }
  }

  // Handle 'Paid' status with a transaction
  try {
    const payableRef = doc(db, 'payables', id);
    
    await runTransaction(db, async (transaction) => {
        const payableDoc = await transaction.get(payableRef);
        if (!payableDoc.exists()) {
            throw new Error("Payable document not found!");
        }
        const payableData = payableDoc.data() as Payable;

        if (payableData.status === 'Paid') {
            console.log("Payable already marked as Paid.");
            return; // Avoid double-processing
        }

        const amount = payableData.payableAmount;

        const summaryDoc = await transaction.get(walletSummaryRef);
        if (!summaryDoc.exists()) {
            throw new Error("Wallet summary not found!");
        }
        const summaryData = summaryDoc.data() as { totalBalance: number; revenue: number };
        
        if (summaryData.totalBalance < amount) {
            throw new Error('Insufficient wallet balance.');
        }

        transaction.update(payableRef, { status: 'Paid' });
        
        transaction.update(walletSummaryRef, { totalBalance: summaryData.totalBalance - amount });

        const newHistory: Omit<PaymentHistory, 'id'> = {
            date: new Date().toISOString().split('T')[0],
            name: `Paid to ${payableData.recipientName}`,
            transactionId: `PAY-${payableData.id}`,
            amount,
            paymentMethod: 'Wallet',
            type: 'Debit',
        };
        const newHistoryRef = doc(collection(db, 'paymentHistory'));
        transaction.set(newHistoryRef, newHistory);
    });

    return { success: true };
  } catch (error) {
    console.error("Error making payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update status.";
    return { success: false, error: errorMessage };
  }
}

const paymentMethods = ["Wallet", "cash", "cheque", "debit card", "credit card", "gpay", "phonepe", "paytm", "upi", "others"] as const;
const walletActions = ["Topup wallet", "Receive from partner", "Receive from customer", "Send to partner", "Send to customer"] as const;


// --- Manage Wallet Transaction ---
const manageWalletSchema = z.object({
  action: z.enum(walletActions),
  amount: z.coerce.number().min(1),
  paymentMethod: z.enum(paymentMethods),
  password: z.string().min(1),
  userId: z.string().min(1),
  recipientId: z.string().optional(),
}).superRefine((data, ctx) => {
    if ((data.action.includes('partner') || data.action.includes('customer')) && (!data.recipientId || data.recipientId.trim().length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["recipientId"],
            message: "Recipient ID is required for this action.",
        });
    }
});


export async function manageWalletTransaction(data: z.infer<typeof manageWalletSchema>) {
  const validation = manageWalletSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Invalid input.' };
  }

  const { action, amount, paymentMethod, password, userId, recipientId } = validation.data;

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
    
    // 2. Perform transaction logic using Firestore Transaction
    await runTransaction(db, async (transaction) => {
      const summaryDoc = await transaction.get(walletSummaryRef);
      if (!summaryDoc.exists()) {
          throw new Error("Wallet summary not found!");
      }
      const summaryData = summaryDoc.data() as { totalBalance: number; revenue: number };
      
      let transactionName: string;
      let newHistory: Omit<PaymentHistory, 'id'>;

      switch (action) {
        case 'Topup wallet':
          transactionName = 'Wallet Top-up';
          newHistory = {
            date: new Date().toISOString().split('T')[0],
            name: transactionName,
            transactionId: `TXN_${crypto.randomUUID()}`,
            amount,
            paymentMethod,
            type: 'Credit',
          };
          transaction.update(walletSummaryRef, {
            totalBalance: summaryData.totalBalance + amount,
          });
          break;
        
        case 'Receive from partner':
        case 'Receive from customer':
          transactionName = action === 'Receive from partner'
            ? `Received from partner: ${recipientId}`
            : `Received from customer: ${recipientId}`;
          newHistory = {
            date: new Date().toISOString().split('T')[0],
            name: transactionName,
            transactionId: `TXN_${crypto.randomUUID()}`,
            amount,
            paymentMethod,
            type: 'Credit',
          };
          transaction.update(walletSummaryRef, {
            totalBalance: summaryData.totalBalance + amount,
            revenue: summaryData.revenue + amount,
          });
          break;

        case 'Send to partner':
        case 'Send to customer':
          transactionName = action === 'Send to partner'
            ? `Paid to partner: ${recipientId}`
            : `Paid to customer: ${recipientId}`;
          if (summaryData.totalBalance < amount) {
            throw new Error('Insufficient wallet balance.');
          }
          newHistory = {
            date: new Date().toISOString().split('T')[0],
            name: transactionName,
            transactionId: `TXN_${crypto.randomUUID()}`,
            amount,
            paymentMethod,
            type: 'Debit',
          };
          transaction.update(walletSummaryRef, {
            totalBalance: summaryData.totalBalance - amount,
          });
          break;

        default:
          throw new Error('Invalid wallet action');
      }
      
      // 3. Add to payment history inside the transaction
      const newHistoryRef = doc(paymentHistoryRef);
      transaction.set(newHistoryRef, newHistory);
    });

    return { success: true, message: `Transaction '${action}' of ${amount} INR was successful.` };

  } catch (error) {
    console.error('Wallet transaction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

// --- Ad Hoc Payment ---
const adHocPaymentSchema = z.object({
  recipientName: z.string().min(1, 'Recipient name is required.'),
  recipientId: z.string().min(1, 'Recipient ID is required.'),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  paymentMethod: z.enum(paymentMethods),
  password: z.string().min(1, 'Admin password is required.'),
  userId: z.string().min(1),
});

export async function makeAdHocPayment(data: z.infer<typeof adHocPaymentSchema>) {
  const validation = adHocPaymentSchema.safeParse(data);
  if (!validation.success) {
      return { success: false, error: 'Invalid input.' };
  }

  const { userId, password, amount, paymentMethod, recipientName, recipientId } = data;

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
      
      // 2. Run transaction
      await runTransaction(db, async (transaction) => {
          // A. Update wallet balance if necessary
          if (paymentMethod === 'Wallet') {
              const summaryDoc = await transaction.get(walletSummaryRef);
              if (!summaryDoc.exists()) {
                  throw new Error("Wallet summary not found!");
              }
              const summaryData = summaryDoc.data() as { totalBalance: number };
              if (summaryData.totalBalance < amount) {
                  throw new Error('Insufficient wallet balance.');
              }
              transaction.update(walletSummaryRef, { totalBalance: summaryData.totalBalance - amount });
          }

          // B. Create new payable doc with status 'Paid'
          const newPayableRef = doc(payablesRef);
          transaction.set(newPayableRef, {
              date: new Date().toISOString().split('T')[0],
              recipientName: recipientName,
              recipientId: recipientId,
              payableAmount: amount,
              status: 'Paid',
          });
          
          // C. Create new payment history doc
          const newHistoryRef = doc(paymentHistoryRef);
          transaction.set(newHistoryRef, {
              date: new Date().toISOString().split('T')[0],
              name: `Paid to ${recipientName}`,
              transactionId: `PAY-${newPayableRef.id}`,
              amount: amount,
              paymentMethod: paymentMethod,
              type: 'Debit',
          });
      });
      
      return { success: true, message: 'Payment recorded successfully.' };

  } catch (error) {
      console.error('Ad-hoc payment error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      return { success: false, error: errorMessage };
  }
}
