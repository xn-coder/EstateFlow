
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where, QueryConstraint } from 'firebase/firestore';
import type { Customer } from '@/types';

export async function getCustomers(partnerId?: string): Promise<Customer[]> {
  try {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const allCustomers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));

    if (partnerId) {
        return allCustomers.filter(customer => customer.createdBy === partnerId);
    }
    
    return allCustomers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}
