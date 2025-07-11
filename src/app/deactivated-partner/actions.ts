'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import type { User, PartnerData, PartnerActivationInfo } from '@/types';

export async function getDeactivatedPartners(): Promise<PartnerActivationInfo[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'Partner'), where('status', '==', 'Deactivated'));
    const usersSnapshot = await getDocs(q);

    if (usersSnapshot.empty) {
      return [];
    }

    const partnerInfos = await Promise.all(usersSnapshot.docs.map(async (userDoc) => {
      const user = { id: userDoc.id, ...userDoc.data() } as User;
      
      if (!user.partnerProfileId) {
        return null;
      }
      
      const profileRef = doc(db, 'partnerProfiles', user.partnerProfileId);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        return null;
      }
      
      const profileData = profileSnap.data();
      const profile: PartnerData = {
          id: profileSnap.id,
          ...(profileData as Omit<PartnerData, 'id'>)
      };

      return { user, profile };
    }));

    return partnerInfos.filter(Boolean) as PartnerActivationInfo[];
  } catch (error) {
    console.error("Error fetching deactivated partners:", error);
    return [];
  }
}

export async function reactivatePartner(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'Active'
    });
    return { success: true };
  } catch (error) {
    console.error("Error reactivating partner:", error);
    return { success: false, error: 'Failed to reactivate partner.' };
  }
}
