
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
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
  slideshows: z.array(catalogSlideshowSchema).optional(),
  // Step 4
  detailsContent: z.string().optional(),
  // Step 5
  faqs: z.array(catalogFAQSchema).optional(),
  // Step 6
  galleryImages: z.array(z.string()).optional(),
  // Step 7
  videoLink: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  // Step 8
  marketingKits: z.array(catalogMarketingKitSchema).optional(),
  // Step 9
  notesContent: z.string().optional(),
  termsContent: z.string().optional(),
  policyContent: z.string().optional(),
});


export async function addCatalog(data: Omit<Catalog, 'id'>) {
  const placeholderImage = 'https://placehold.co/600x400.png';
  const placeholderFile = 'placeholder.pdf';
  const isBase64 = (str: string | undefined): boolean => !!str && str.startsWith('data:');

  const dataForFirestore: Omit<Catalog, 'id'> = {
    ...data,
    featuredImage: isBase64(data.featuredImage) ? placeholderImage : data.featuredImage,
    slideshows: (data.slideshows || []).map(s => ({
      ...s,
      image: isBase64(s.image) ? placeholderImage : s.image,
    })),
    galleryImages: (data.galleryImages || []).map(img => isBase64(img) ? placeholderImage : img),
    marketingKits: (data.marketingKits || []).map(kit => ({
      ...kit,
      featuredImage: isBase64(kit.featuredImage) ? placeholderImage : kit.featuredImage,
      uploadedFile: isBase64(kit.uploadedFile) ? (kit.uploadedFile.startsWith('data:image') ? placeholderImage : placeholderFile) : kit.uploadedFile,
    })),
  };

  // Clean up data before validation.
  const cleanedData = {
    ...dataForFirestore,
    slideshows: (dataForFirestore.slideshows || []).filter(s => s.image && s.title),
    faqs: (dataForFirestore.faqs || []).filter(f => f.question && f.answer),
    marketingKits: (dataForFirestore.marketingKits || []).filter(k => k.featuredImage && k.nameOrTitle && k.uploadedFile),
    galleryImages: (dataForFirestore.galleryImages || []).filter(g => g),
    videoLink: dataForFirestore.videoLink || '',
  };

  const validation = catalogSchema.safeParse(cleanedData);
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

export async function getCatalogs(): Promise<Catalog[]> {
  try {
    const catalogsSnapshot = await getDocs(collection(db, 'catalogs'));
    return catalogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Catalog));
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    return [];
  }
}
