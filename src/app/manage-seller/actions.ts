
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { User } from '@/types';

export async function getSellers(): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'Seller'));
    const usersSnapshot = await getDocs(q);

    if (usersSnapshot.empty) {
      return [];
    }
    
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

  } catch (error) {
    console.error("Error fetching sellers:", error);
    return [];
  }
}

export async function toggleSellerStatus(userId: string, currentStatus: 'Active' | 'Deactivated'): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', userId);
    const newStatus = currentStatus === 'Active' ? 'Deactivated' : 'Active';
    await updateDoc(userRef, {
      status: newStatus
    });
    return { success: true };
  } catch (error) {
    console.error(`Error updating seller status to ${currentStatus === 'Active' ? 'Deactivated' : 'Active'}:`, error);
    return { success: false, error: 'Failed to update seller status.' };
  }
}
