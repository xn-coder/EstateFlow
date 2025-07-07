'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { WebsiteData } from '@/types';
import { websiteData as initialWebsiteData } from '@/lib/website-data';
import * as z from 'zod';

const configRef = doc(db, 'website', 'config');

export async function getWebsiteData(): Promise<WebsiteData> {
  try {
    const docSnap = await getDoc(configRef);

    if (docSnap.exists()) {
      return docSnap.data() as WebsiteData;
    } else {
      await setDoc(configRef, initialWebsiteData);
      return initialWebsiteData;
    }
  } catch (error) {
    console.error("Error fetching or creating website data:", error);
    // Return initial data as a fallback if firestore fails
    return initialWebsiteData;
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
export async function updateBusinessInfo(data: z.infer<typeof businessInfoSchema>) {
  const validation = businessInfoSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data' };
  try {
    await updateDoc(configRef, { businessInfo: data });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update business info.' };
  }
}

export async function updateSlideshows(data: z.infer<typeof slideshowItemSchema>[]) {
  const validation = z.array(slideshowItemSchema).safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid slideshow data' };
  try {
    await updateDoc(configRef, { slideshows: data });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update slideshows.' };
  }
}

export async function updateContactDetails(data: z.infer<typeof contactDetailsSchema>) {
   const validation = contactDetailsSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data' };
  try {
    await updateDoc(configRef, { contactDetails: data });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update contact details.' };
  }
}

export async function updateLegalInfo(data: z.infer<typeof legalInfoSchema>) {
  const validation = legalInfoSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data' };
  try {
    await updateDoc(configRef, { legalInfo: data });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update legal info.' };
  }
}

export async function updateLinks(data: z.infer<typeof linksSchema>) {
  const validation = linksSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data' };
  try {
    await updateDoc(configRef, { links: data });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update links.' };
  }
}

export async function updatePartnerFees(data: z.infer<typeof partnerFeesSchema>) {
  const validation = partnerFeesSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data' };
  try {
    await updateDoc(configRef, { partnerFees: data });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update partner fees.' };
  }
}

export async function getPartnerFees() {
    const data = await getWebsiteData();
    return data.partnerFees;
}
