'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import * as z from 'zod';
import type { Catalog } from '@/types';

const catalogSlideshowSchema = z.object({
  id: z.string(),
  image: z.string().min(1, 'Image is required'),
  title: z.string().min(1, 'Title is required'),
});

const catalogFAQSchema = z.object({
  id: z.string(),
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
});

const catalogMarketingKitSchema = z.object({
  id: z.string(),
  kitType: z.enum(['poster', 'brochure']),
  featuredImage: z.string().min(1, 'Image is required'),
  nameOrTitle: z.string().min(1, 'Name or title is required'),
  uploadedFile: z.string().min(1, 'File is required'),
});

const catalogSchema: z.ZodType<Omit<Catalog, 'id'>> = z.object({
  // Step 1
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  metaKeyword: z.string().optional(),
  mainCategory: z.string().min(1, 'Main category is required'),
  categoryName: z.string().min(1, 'Category name is required'),
  featuredImage: z.string().min(1, 'Featured image is required'),
  // Step 2
  pricingType: z.enum(['INR', 'USD']),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be a positive number'),
  earningType: z.enum(['Fixed rate', 'commission', 'reward point']),
  earning: z.coerce.number().min(0, 'Earning must be a positive number'),
  // Step 3
  slideshows: z.array(catalogSlideshowSchema).min(1, 'At least one slideshow is required'),
  // Step 4
  detailsContent: z.string().min(1, 'Details content is required'),
  // Step 5
  faqs: z.array(catalogFAQSchema).min(1, 'At least one FAQ is required'),
  // Step 6
  galleryImages: z.array(z.string()).min(1, 'At least one gallery image is required'),
  // Step 7
  videoLink: z.string().url('Must be a valid URL'),
  // Step 8
  marketingKits: z.array(catalogMarketingKitSchema).min(1, 'At least one marketing kit is required'),
  // Step 9
  notesContent: z.string().optional(),
  termsContent: z.string().optional(),
  policyContent: z.string().optional(),
});


export async function addCatalog(data: Omit<Catalog, 'id'>) {
  const validation = catalogSchema.safeParse(data);
  if (!validation.success) {
    console.error('Validation errors:', validation.error.flatten());
    return { success: false, error: 'Invalid data submitted. Please check all form fields.' };
  }
  
  try {
    await addDoc(collection(db, 'catalogs'), validation.data);
    return { success: true, message: 'Catalog added successfully!' };
  } catch (error) {
    console.error('Error adding catalog:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
