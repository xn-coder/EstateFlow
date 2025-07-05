'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import type { User, PartnerData, PartnerActivationInfo } from '@/types';

export async function getActivePartners(): Promise<PartnerActivationInfo[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'Partner'), where('status', '==', 'Active'));
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
    console.error("Error fetching active partners:", error);
    return [];
  }
}

export async function deactivatePartner(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'Deactivated'
    });
    return { success: true };
  } catch (error) {
    console.error("Error deactivating partner:", error);
    return { success: false, error: 'Failed to deactivate partner.' };
  }
}

export async function getPartnerById(userId: string): Promise<PartnerActivationInfo | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists() || userDoc.data().role !== 'Partner') {
      return null;
    }

    const user = { id: userDoc.id, ...userDoc.data() } as User;

    if (!user.partnerProfileId) {
        // Create a default empty profile to avoid crashing the page.
        const profile: PartnerData = {
            id: '', name: user.name, email: user.email, phone: user.phone || '',
            dob: new Date().toISOString(), gender: 'Other', qualification: '',
            whatsapp: '', address: '', city: '', state: '', pincode: '',
            businessType: '', businessAge: 0, areaCovered: '',
            aadhaarCard: '', panCard: '',
        }
        return { user, profile };
    }

    const profileRef = doc(db, 'partnerProfiles', user.partnerProfileId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
       // Return user with default profile
        const profile: PartnerData = {
            id: '', name: user.name, email: user.email, phone: user.phone || '',
            dob: new Date().toISOString(), gender: 'Other', qualification: '',
            whatsapp: '', address: '', city: '', state: '', pincode: '',
            businessType: '', businessAge: 0, areaCovered: '',
            aadhaarCard: '', panCard: '',
        }
        return { user, profile };
    }
    
    const profileData = profileSnap.data();
    const profile: PartnerData = {
        id: profileSnap.id,
        ...(profileData as Omit<PartnerData, 'id'>)
    };

    return { user, profile };

  } catch (error) {
    console.error(`Error fetching partner by ID (${userId}):`, error);
    return null;
  }
}
