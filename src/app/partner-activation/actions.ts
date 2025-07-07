
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import type { User, PartnerData, PartnerActivationInfo } from '@/types';

export async function getPendingPartners(): Promise<PartnerActivationInfo[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'Partner'), where('status', '==', 'Pending'));
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
    console.error("Error fetching pending partners:", error);
    return [];
  }
}

export async function activatePartner(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Fetch profile to determine partner category
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error("User not found to generate partner code.");
    const user = userDoc.data() as User;
    if (!user.partnerProfileId) throw new Error("User has no partner profile linked.");
    
    const profileRef = doc(db, 'partnerProfiles', user.partnerProfileId);
    const profileDoc = await getDoc(profileRef);
    if (!profileDoc.exists()) throw new Error("Partner profile not found.");
    const profile = profileDoc.data() as PartnerData;

    let prefix: string;
    switch (profile.partnerCategory) {
      case 'Affiliate Partner':
        prefix = 'AF';
        break;
      case 'Super Affiliate Partner':
        prefix = 'SFA';
        break;
      case 'Associate Partner':
        prefix = 'AS';
        break;
      case 'Channel Partner':
        prefix = 'CP';
        break;
      default:
        // Fallback prefix
        prefix = 'DAS';
    }

    const partnerCode = `${prefix}${crypto.randomUUID().substring(0, 9).toUpperCase()}`;

    await updateDoc(userRef, {
      status: 'Active',
      partnerCode: partnerCode,
    });
    return { success: true };
  } catch (error) {
    console.error("Error activating partner:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to activate partner.';
    return { success: false, error: errorMessage };
  }
}

export async function deletePendingPartner(userId: string, partnerProfileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const batch = writeBatch(db);

    const userRef = doc(db, 'users', userId);
    const profileRef = doc(db, 'partnerProfiles', partnerProfileId);

    batch.delete(userRef);
    batch.delete(profileRef);

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error("Error deleting pending partner:", error);
    return { success: false, error: 'Failed to delete partner registration.' };
  }
}


export async function approveFeePayment(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      feeStatus: 'Paid'
    });
    return { success: true };
  } catch (error) {
    console.error("Error approving fee payment:", error);
    return { success: false, error: 'Failed to approve fee payment.' };
  }
}
