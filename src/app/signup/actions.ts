
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import { qualifications, FeeApplicablePartnerCategory, feeApplicablePartnerCategories, partnerCategories } from '@/types';

// This is the full schema for validation on the server.
const partnerSchema = z.object({
  profileImage: z.string().optional(),
  name: z.string().min(1),
  dob: z.date(),
  gender: z.enum(['Male', 'Female', 'Other']),
  qualification: z.enum(qualifications),
  phone: z.string().min(10),
  email: z.string().email(),
  whatsapp: z.string().min(10),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(6),
  businessLogo: z.string().optional(),
  businessType: z.string().min(1),
  gstn: z.string().optional(),
  businessAge: z.coerce.number().min(0),
  areaCovered: z.string().min(1),
  aadhaarNumber: z.string().length(12),
  aadhaarCard: z.string().min(1),
  panNumber: z.string().length(10),
  panCard: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  partnerCategory: z.enum(partnerCategories),
  paymentProof: z.string().optional(),
});

export async function registerPartner(data: Omit<z.infer<typeof partnerSchema>, 'password'> & { password?: string }) {
  // We omit password from the data type so it isn't passed around, but we need it for validation.
  const validation = partnerSchema.safeParse(data);
  if (!validation.success) {
    console.error('Validation errors:', validation.error.flatten());
    return { success: false, error: 'Invalid data submitted. Please check the form.' };
  }

  const { email, name, phone, dob, password, partnerCategory, ...profileData } = validation.data;

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { success: false, error: 'A user with this email already exists.' };
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Convert date to string for Firestore
    const dataForFirestore = {
        ...profileData,
        name,
        email,
        phone,
        dob: dob.toISOString(),
        partnerCategory,
    };
    
    // Create partner profile
    const partnerProfileRef = await addDoc(collection(db, 'partnerProfiles'), dataForFirestore);

    const requiredPaymentCategories = feeApplicablePartnerCategories;
    const feeStatus = requiredPaymentCategories.includes(partnerCategory as FeeApplicablePartnerCategory) ? 'Pending Payment' : 'Not Applicable';

    // Create a corresponding user entry
    await addDoc(usersRef, {
      name: name,
      email: email,
      phone: phone,
      role: 'Partner',
      passwordHash: passwordHash,
      avatar: validation.data.profileImage || `https://placehold.co/40x40.png`,
      partnerProfileId: partnerProfileRef.id, // Link to the detailed profile
      status: 'Pending',
      feeStatus: feeStatus,
      userCode: `US${Math.random().toString().slice(2, 12)}`,
    });

    return { success: true, message: 'Partner registered successfully. Your account is pending admin activation.' };
  } catch (error) {
    console.error('Partner registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
