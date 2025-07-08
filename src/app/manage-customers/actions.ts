

'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where, QueryConstraint } from 'firebase/firestore';
import type { Customer } from '@/types';

export async function getCustomers(partnerId?: string, sellerId?: string): Promise<Customer[]> {
  try {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    let allCustomers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));

    if (partnerId) {
        allCustomers = allCustomers.filter(customer => customer.createdBy === partnerId);
    }
    
    if (sellerId) {
        allCustomers = allCustomers.filter(customer => customer.sellerId === sellerId);
    }
    
    return allCustomers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}
