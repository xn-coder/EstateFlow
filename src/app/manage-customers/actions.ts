
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where, QueryConstraint } from 'firebase/firestore';
import type { Customer } from '@/types';

export async function getCustomers(partnerId?: string): Promise<Customer[]> {
  try {
    const customersRef = collection(db, 'customers');
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
    if (partnerId) {
        constraints.push(where('createdBy', '==', partnerId));
    }
    const q = query(customersRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}
