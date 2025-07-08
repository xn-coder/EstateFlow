

'use server';

import { db } from '@/lib/firebase';
import { collection, doc, getDocs, getDoc, writeBatch, updateDoc, addDoc, query, limit, setDoc, where, runTransaction, orderBy, QueryConstraint } from 'firebase/firestore';
import type { Payable, PaymentHistory, Receivable, User, WalletSummary, PartnerWalletData, RewardPointTransaction } from '@/types';
import * as z from 'zod';
import bcrypt from 'bcryptjs';

// --- Data Fetching Actions ---

export async function getWalletSummaryData(userId: string): Promise<WalletSummary> {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error("User not found to fetch wallet summary.");
        }
        
        const userData = userSnap.data() as User;
        const summaryData = userData.walletSummary || { totalBalance: 0, revenue: 0 };
        
        const sellerId = userData.role === 'Seller' ? userData.id : undefined;

        const payablesQuery = query(collection(db, 'payables'), where('status', '==', 'Pending'), where('sellerId', '==', sellerId));
        const receivablesQuery = query(collection(db, 'receivables'), where('status', '==', 'Pending'), where('sellerId', '==', sellerId));

        const [payablesSnap, receivablesSnap] = await Promise.all([
            getDocs(payablesQuery),
            getDocs(receivablesQuery),
        ]);
        
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

export async function getReceivables(sellerId?: string): Promise<Receivable[]> {
  const constraints: QueryConstraint[] = [];
  if (sellerId) {
      constraints.push(where("sellerId", "==", sellerId));
  }
  const q = query(collection(db, 'receivables'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receivable));
}

export async function getPayables(sellerId?: string): Promise<Payable[]> {
  const constraints: QueryConstraint[] = [];
  if (sellerId) {
      constraints.push(where("sellerId", "==", sellerId));
  }
  const q = query(collection(db, 'payables'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payable));
}

export async function getPaymentHistory(sellerId?: string): Promise<PaymentHistory[]> {
  const constraints: QueryConstraint[] = [];
  if (sellerId) {
      constraints.push(where("sellerId", "==", sellerId));
  }
  const q = query(collection(db, 'paymentHistory'), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentHistory));
}

// --- Data Update Actions ---

export async function updateReceivableStatus(id: string, status: 'Pending' | 'Received') {
  const receivableRef = doc(db, 'receivables', id);

  try {
    if (status === 'Pending') {
      await updateDoc(receivableRef, { status });
      return { success: true };
    }

    // Handle 'Received' status with a transaction
    await runTransaction(db, async (transaction) => {
      const receivableDoc = await transaction.get(receivableRef);
      if (!receivableDoc.exists()) throw new Error("Receivable document not found!");
      const receivableData = receivableDoc.data() as Receivable;
      
      if (receivableData.status === 'Received') return; // Avoid double-processing
      if (!receivableData.sellerId) throw new Error("Receivable is missing seller ID.");
      
      const amount = receivableData.pendingAmount;
      const sellerRef = doc(db, 'users', receivableData.sellerId);
      const sellerDoc = await transaction.get(sellerRef);
      if (!sellerDoc.exists()) throw new Error("Seller not found for this transaction.");

      transaction.update(receivableRef, { status: 'Received' });

      const sellerData = sellerDoc.data() as User;
      const currentWallet = sellerData.walletSummary || { totalBalance: 0, revenue: 0 };
      transaction.update(sellerRef, {
        'walletSummary.totalBalance': currentWallet.totalBalance + amount,
      });
      
      const newHistoryRef = doc(collection(db, 'paymentHistory'));
      const newHistory: Omit<PaymentHistory, 'id'> = {
        date: new Date().toISOString().split('T')[0],
        name: `Received from ${receivableData.partnerName}`,
        transactionId: `PAY${Math.random().toString().slice(2, 14)}`,
        amount,
        paymentMethod: 'System',
        type: 'Credit',
        sellerId: receivableData.sellerId,
      };
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
   const payableRef = doc(db, 'payables', id);

   try {
    if (status === 'Pending') {
      await updateDoc(payableRef, { status });
      return { success: true };
    }

    // Handle 'Paid' status with a transaction
    await runTransaction(db, async (transaction) => {
        const payableDoc = await transaction.get(payableRef);
        if (!payableDoc.exists()) throw new Error("Payable document not found!");
        const payableData = payableDoc.data() as Payable;

        if (payableData.status === 'Paid') return; // Avoid double-processing
        if (!payableData.sellerId) throw new Error("Payable is missing seller ID.");

        const amount = payableData.payableAmount;
        const sellerRef = doc(db, 'users', payableData.sellerId);
        const sellerDoc = await transaction.get(sellerRef);
        if (!sellerDoc.exists()) throw new Error("Seller not found for this transaction.");
        const sellerData = sellerDoc.data() as User;
        const currentWallet = sellerData.walletSummary || { totalBalance: 0, revenue: 0 };
        
        if (currentWallet.totalBalance < amount) {
            throw new Error('Insufficient wallet balance.');
        }

        transaction.update(payableRef, { status: 'Paid' });
        
        transaction.update(sellerRef, { 'walletSummary.totalBalance': currentWallet.totalBalance - amount });

        const newHistoryRef = doc(collection(db, 'paymentHistory'));
        const newHistory: Omit<PaymentHistory, 'id'> = {
            date: new Date().toISOString().split('T')[0],
            name: `Paid to ${payableData.recipientName}`,
            transactionId: `PAY${Math.random().toString().slice(2, 14)}`,
            amount,
            paymentMethod: 'Wallet',
            type: 'Debit',
            sellerId: payableData.sellerId,
        };
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
    
    await runTransaction(db, async (transaction) => {
      const sellerDoc = await transaction.get(userRef);
      if (!sellerDoc.exists()) throw new Error("Seller user not found!");
      const sellerData = sellerDoc.data() as User;
      const currentWallet = sellerData.walletSummary || { totalBalance: 0, revenue: 0 };
      
      let transactionName: string;
      let newHistory: Omit<PaymentHistory, 'id'>;

      switch (action) {
        case 'Topup wallet':
          transactionName = 'Wallet Top-up';
          newHistory = {
            date: new Date().toISOString().split('T')[0],
            name: transactionName,
            transactionId: `PAY${Math.random().toString().slice(2, 14)}`,
            amount,
            paymentMethod,
            type: 'Credit',
            sellerId: userId,
          };
          transaction.update(userRef, {
            'walletSummary.totalBalance': currentWallet.totalBalance + amount,
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
            transactionId: `PAY${Math.random().toString().slice(2, 14)}`,
            amount,
            paymentMethod,
            type: 'Credit',
            sellerId: userId,
          };
          transaction.update(userRef, {
            'walletSummary.totalBalance': currentWallet.totalBalance + amount,
            'walletSummary.revenue': currentWallet.revenue + amount,
          });
          break;

        case 'Send to partner':
        case 'Send to customer':
          transactionName = action === 'Send to partner'
            ? `Paid to partner: ${recipientId}`
            : `Paid to customer: ${recipientId}`;
          if (currentWallet.totalBalance < amount) {
            throw new Error('Insufficient wallet balance.');
          }
          newHistory = {
            date: new Date().toISOString().split('T')[0],
            name: transactionName,
            transactionId: `PAY${Math.random().toString().slice(2, 14)}`,
            amount,
            paymentMethod,
            type: 'Debit',
            sellerId: userId,
          };
          transaction.update(userRef, {
            'walletSummary.totalBalance': currentWallet.totalBalance - amount,
          });
          break;

        default:
          throw new Error('Invalid wallet action');
      }
      
      const newHistoryRef = doc(collection(db, 'paymentHistory'));
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
      
      await runTransaction(db, async (transaction) => {
          if (paymentMethod === 'Wallet') {
              const sellerDoc = await transaction.get(userRef);
              if (!sellerDoc.exists()) throw new Error("Seller user not found!");
              const sellerData = sellerDoc.data() as User;
              const currentWallet = sellerData.walletSummary || { totalBalance: 0, revenue: 0 };
              if (currentWallet.totalBalance < amount) {
                  throw new Error('Insufficient wallet balance.');
              }
              transaction.update(userRef, { 'walletSummary.totalBalance': currentWallet.totalBalance - amount });
          }

          const newPayableRef = doc(collection(db, 'payables'));
          transaction.set(newPayableRef, {
              date: new Date().toISOString().split('T')[0],
              recipientName: recipientName,
              recipientId: recipientId,
              payableAmount: amount,
              status: 'Paid',
              description: `Ad-hoc payment to ${recipientName}`,
              sellerId: userId,
          });
          
          const newHistoryRef = doc(collection(db, 'paymentHistory'));
          transaction.set(newHistoryRef, {
              date: new Date().toISOString().split('T')[0],
              name: `Paid to ${recipientName}`,
              transactionId: `PAY${Math.random().toString().slice(2, 14)}`,
              amount: amount,
              paymentMethod: paymentMethod,
              type: 'Debit',
              sellerId: userId,
          });
      });
      
      return { success: true, message: 'Payment recorded successfully.' };

  } catch (error) {
      console.error('Ad-hoc payment error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      return { success: false, error: errorMessage };
  }
}

export async function getPartnerWalletData(partnerId: string): Promise<PartnerWalletData> {
  try {
    const userRef = doc(db, 'users', partnerId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return { totalEarning: 0, paidAmount: 0, pendingAmount: 0, amountOwed: 0, rewardPoints: 0, transactions: [] };
    }
    const user = userSnap.data() as User;
    
    const partnerIdentifier = user.partnerCode || user.id;

    const payablesQuery = query(collection(db, 'payables'), where('recipientId', '==', partnerIdentifier));
    const receivablesQuery = query(collection(db, 'receivables'), where('partnerId', '==', partnerIdentifier), where('status', '==', 'Pending'));
    
    const [payablesSnapshot, receivablesSnapshot] = await Promise.all([
        getDocs(payablesQuery),
        getDocs(receivablesQuery)
    ]);
    
    const transactions = payablesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payable));

    let totalEarning = 0;
    let paidAmount = 0;
    let pendingAmount = 0;

    transactions.forEach(t => {
      totalEarning += t.payableAmount;
      if (t.status === 'Paid') {
        paidAmount += t.payableAmount;
      } else {
        pendingAmount += t.payableAmount;
      }
    });

    const amountOwed = receivablesSnapshot.docs.reduce((sum, doc) => sum + doc.data().pendingAmount, 0);

    return {
      totalEarning,
      paidAmount,
      pendingAmount,
      amountOwed,
      rewardPoints: user.rewardPoints || 0,
      transactions,
    };
  } catch (error) {
    console.error("Error fetching partner wallet data:", error);
    return { totalEarning: 0, paidAmount: 0, pendingAmount: 0, amountOwed: 0, rewardPoints: 0, transactions: [] };
  }
}

// --- Send Reward Points ---
const sendRewardPointsSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID/Code/Email is required.'),
  points: z.coerce.number().min(1, 'Points must be a positive number.'),
  description: z.string().optional(),
  sellerId: z.string(),
  password: z.string().min(1, 'Your password is required to confirm.'),
});

export async function sendRewardPoints(data: z.infer<typeof sendRewardPointsSchema>) {
    const validation = sendRewardPointsSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: 'Invalid data submitted.' };
    }

    const { recipientId, points, sellerId, password, description } = validation.data;

    try {
        const sellerRef = doc(db, 'users', sellerId);
        const sellerDoc = await getDoc(sellerRef);
        if (!sellerDoc.exists() || sellerDoc.data().role !== 'Seller') {
            return { success: false, error: 'Invalid seller account.' };
        }
        const seller = sellerDoc.data() as User & { passwordHash: string };
        const isPasswordValid = await bcrypt.compare(password, seller.passwordHash);
        if (!isPasswordValid) {
            return { success: false, error: 'Incorrect password.' };
        }

        const usersRef = collection(db, 'users');
        let partnerSnapshot = await getDocs(query(usersRef, where('role', '==', 'Partner'), where('partnerCode', '==', recipientId)));

        if (partnerSnapshot.empty) {
            partnerSnapshot = await getDocs(query(usersRef, where('role', '==', 'Partner'), where('email', '==', recipientId)));
        }
        
        if (partnerSnapshot.empty) {
            return { success: false, error: `Partner with ID/Email "${recipientId}" not found.` };
        }

        const partnerDoc = partnerSnapshot.docs[0];
        const partnerRef = doc(db, 'users', partnerDoc.id);
        const partner = partnerDoc.data() as User;

        await runTransaction(db, async (transaction) => {
            const freshPartnerDoc = await transaction.get(partnerRef);
            if (!freshPartnerDoc.exists()) {
                throw new Error("Partner not found inside transaction.");
            }
            const currentPoints = freshPartnerDoc.data().rewardPoints || 0;
            const newPoints = currentPoints + points;
            transaction.update(partnerRef, { rewardPoints: newPoints });

            const rewardHistoryRef = doc(collection(db, 'rewardPointHistory'));
            const newTransaction: Omit<RewardPointTransaction, 'id'> = {
                date: new Date().toISOString(),
                partnerId: partnerDoc.id,
                partnerName: partner.name,
                sellerId: sellerId,
                sellerName: seller.name,
                points: points,
                type: 'Credit',
                description: description || `Points awarded by ${seller.name}`,
            };
            transaction.set(rewardHistoryRef, newTransaction);
        });

        return { success: true, message: `${points} reward points sent successfully!` };

    } catch (error) {
        console.error('Error sending reward points:', error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: errorMessage };
    }
}

export async function getRewardPointHistory({ partnerId, sellerId }: { partnerId?: string; sellerId?: string }): Promise<RewardPointTransaction[]> {
    try {
        const historyRef = collection(db, 'rewardPointHistory');
        const constraints = [];
        if (partnerId) {
            constraints.push(where('partnerId', '==', partnerId));
        }
        if (sellerId) {
            constraints.push(where('sellerId', '==', sellerId));
        }
        
        if (constraints.length === 0) {
            // By default, don't return all history if no ID is provided.
            return [];
        }

        constraints.push(orderBy('date', 'desc'));

        const q = query(historyRef, ...constraints);
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RewardPointTransaction));
    } catch (error) {
        console.error("Error fetching reward point history:", error);
        return [];
    }
}
