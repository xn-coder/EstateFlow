
'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import type { User, WebsiteData, FeeApplicablePartnerCategory } from '@/types';
import { websiteData as initialWebsiteData } from '@/lib/website-data';
import * as z from 'zod';

const globalConfigRef = doc(db, 'website', 'config');

export async function getWebsiteData(userId: string): Promise<Omit<WebsiteData, 'partnerFees'> | null> {
  const { partnerFees, ...defaultUserData } = initialWebsiteData;
  if (!userId) {
    console.error("getWebsiteData called without a userId.");
    return defaultUserData;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const userData = docSnap.data() as User;
      if (userData.websiteData) {
        return userData.websiteData;
      } else {
        await updateDoc(userRef, { websiteData: defaultUserData });
        return defaultUserData;
      }
    } else {
      console.error(`User with ID ${userId} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching website data for user ${userId}:`, error);
    return defaultUserData;
  }
}

export async function getPartnerFees(): Promise<WebsiteData['partnerFees']> {
  try {
    const docSnap = await getDoc(globalConfigRef);
    if (docSnap.exists() && docSnap.data()?.partnerFees) {
      return docSnap.data().partnerFees;
    } else {
      await updateDoc(globalConfigRef, { partnerFees: initialWebsiteData.partnerFees }, { merge: true });
      return initialWebsiteData.partnerFees;
    }
  } catch (error) {
    console.error("Error fetching partner fees:", error);
    return initialWebsiteData.partnerFees;
  }
}


// Schemas for validation
const businessInfoSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  avatar: z.string(),
  metaKeywords: z.string().optional(),
  metaDescription: z.string().optional(),
});

const slideshowItemSchema = z.object({
  id: z.string(),
  image: z.string(),
  title: z.string().min(1),
  link: z.string().url().or(z.string().startsWith('#')),
});

const contactDetailsSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
});

const legalInfoSchema = z.object({
    about: z.string().min(1),
    terms: z.string().url(),
    privacy: z.string().url(),
    refund: z.string().url(),
    disclaimer: z.string().url(),
});

const linksSchema = z.object({
    website: z.string().url(),
    facebook: z.string().url(),
    instagram: z.string().url(),
    linkedin: z.string().url(),
    youtube: z.string().url(),
});

const partnerFeesSchema = z.object({
  'Super Affiliate Partner': z.coerce.number().min(0),
  'Associate Partner': z.coerce.number().min(0),
  'Channel Partner': z.coerce.number().min(0),
});


// Update functions
export async function updateBusinessInfo(userId: string, data: z.infer<typeof businessInfoSchema>) {
  const validation = businessInfoSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data' };
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 'websiteData.businessInfo': data });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update business info.' };
  }
}

export async function updateSlideshows(userId: string, data: z.infer<typeof slideshowItemSchema>[]) {
  const validation = z.array(slideshowItemSchema).safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid slideshow data' };
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 'websiteData.slideshows': data });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update slideshows.' };
  }
}

export async function updateContactDetails(userId: string, data: z.infer<typeof contactDetailsSchema>) {
   const validation = contactDetailsSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data' };
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 'websiteData.contactDetails': data });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update contact details.' };
  }
}

export async function updateLegalInfo(userId: string, data: z.infer<typeof legalInfoSchema>) {
  const validation = legalInfoSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data' };
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 'websiteData.legalInfo': data });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update legal info.' };
  }
}

export async function updateLinks(userId: string, data: z.infer<typeof linksSchema>) {
  const validation = linksSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data' };
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 'websiteData.links': data });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update links.' };
  }
}

export async function updatePartnerFees(data: z.infer<typeof partnerFeesSchema>) {
  const validation = partnerFeesSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data' };
  try {
    await updateDoc(globalConfigRef, { partnerFees: data });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update partner fees.' };
  }
}

const sellerEnquirySchema = z.object({
  sellerId: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function submitSellerEnquiry(data: z.infer<typeof sellerEnquirySchema>) {
  const validation = sellerEnquirySchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Invalid data submitted.' };
  }

  try {
    await addDoc(collection(db, 'sellerEnquiries'), {
      ...validation.data,
      createdAt: new Date().toISOString(),
      status: 'New',
    });
    return { success: true, message: 'Your enquiry has been submitted successfully!' };
  } catch (error) {
    console.error('Error submitting seller enquiry:', error);
    return { success: false, error: 'Failed to submit enquiry.' };
  }
}
