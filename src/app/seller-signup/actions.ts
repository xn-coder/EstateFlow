

'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import { websiteData as initialWebsiteData } from '@/lib/website-data';

const sellerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  websiteName: z.string().min(1, "Business name is required"),
  websiteTagline: z.string().optional(),
});

export async function registerSeller(data: z.infer<typeof sellerSchema>) {
  const validation = sellerSchema.safeParse(data);
  if (!validation.success) {
    console.error('Validation errors:', validation.error.flatten());
    return { success: false, error: 'Invalid data submitted. Please check the form.' };
  }

  const { email, name, phone, password, websiteName, websiteTagline } = validation.data;

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { success: false, error: 'A user with this email already exists.' };
    }
    
    const { partnerFees, ...userWebsiteData } = initialWebsiteData;
    
    // Update business info from form
    userWebsiteData.businessInfo.name = websiteName;
    userWebsiteData.businessInfo.tagline = websiteTagline || '';

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create a corresponding user entry
    await addDoc(usersRef, {
      name: name,
      email: email,
      phone: phone || null,
      role: 'Seller',
      passwordHash: passwordHash,
      avatar: `https://placehold.co/40x40.png`,
      status: 'Active', // Sellers are active by default
      userCode: `SLR${Math.random().toString().slice(2, 12)}`,
      websiteData: userWebsiteData,
      walletSummary: { totalBalance: 0, revenue: 0 },
    });

    return { success: true, message: 'Seller registered successfully. You can now log in.' };
  } catch (error) {
    console.error('Seller registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
