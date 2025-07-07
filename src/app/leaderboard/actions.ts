
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { User, SubmittedEnquiry } from '@/types';

export interface LeaderboardEntry {
  partner: User;
  orderCount: number;
}

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  try {
    const usersRef = collection(db, 'users');
    const partnersQuery = query(usersRef, where('role', '==', 'Partner'));
    const partnersSnapshot = await getDocs(partnersQuery);
    const partners = partnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

    const enquiriesRef = collection(db, 'enquiries');
    const ordersQuery = query(enquiriesRef, where('status', '!=', 'New'));
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => doc.data() as SubmittedEnquiry);

    const orderCounts = new Map<string, number>();
    for (const order of orders) {
      if (order.submittedBy?.id) {
        const partnerId = order.submittedBy.id;
        orderCounts.set(partnerId, (orderCounts.get(partnerId) || 0) + 1);
      }
    }

    const leaderboard = partners.map(partner => ({
      partner,
      orderCount: orderCounts.get(partner.id) || 0,
    }));

    leaderboard.sort((a, b) => b.orderCount - a.orderCount);

    return leaderboard;
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return [];
  }
}
