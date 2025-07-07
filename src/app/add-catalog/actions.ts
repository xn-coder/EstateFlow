
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, limit, doc, updateDoc, getDoc } from 'firebase/firestore';
import * as z from 'zod';
import type { Catalog, MarketingKitInfo, CatalogMarketingKit } from '@/types';

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

const catalogSchema: z.ZodType<Omit<Catalog, 'id' | 'catalogCode'>> = z.object({
  // Step 1
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  metaKeyword: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  categoryName: z.string().min(1, 'Category name is required'),
  featuredImage: z.string().min(1, 'Featured image is required'),
  // Step 2
  pricingType: z.enum(['INR', 'USD']),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be a positive number'),
  earningType: z.enum(['Fixed rate', 'commission', 'reward point']),
  earning: z.coerce.number().min(0, 'Earning must be a positive number'),
  partnerCategoryCommissions: z.object({
    'Affiliate Partner': z.coerce.number().optional(),
    'Super Affiliate Partner': z.coerce.number().optional(),
    'Associate Partner': z.coerce.number().optional(),
    'Channel Partner': z.coerce.number().optional(),
  }).optional(),
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


export async function addCatalog(data: Omit<Catalog, 'id' | 'catalogCode'>) {
  const placeholderImage = 'https://placehold.co/600x400.png';
  const placeholderFile = 'placeholder.pdf';
  const isBase64 = (str: string | undefined): boolean => !!str && str.startsWith('data:');

  const dataForFirestore: Omit<Catalog, 'id' | 'catalogCode'> = {
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
    const catalogCode = `CTL${Math.random().toString().slice(2, 11)}`;
    const dataToSave = {
      ...validation.data,
      catalogCode,
    };
    await addDoc(collection(db, 'catalogs'), dataToSave);
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

export async function getMarketingKits(): Promise<MarketingKitInfo[]> {
  try {
    const catalogs = await getCatalogs();
    const allKits: MarketingKitInfo[] = [];

    catalogs.forEach(catalog => {
      if (catalog.marketingKits && catalog.marketingKits.length > 0) {
        const kitsFromCatalog = catalog.marketingKits.map(kit => ({
          ...kit,
          catalogId: catalog.id,
          catalogTitle: catalog.title,
          catalogCode: catalog.catalogCode,
        }));
        allKits.push(...kitsFromCatalog);
      }
    });

    return allKits;
  } catch (error) {
    console.error("Error fetching marketing kits:", error);
    return [];
  }
}

const addMarketingKitSchema = z.object({
  catalogCode: z.string().min(1, 'Catalog code is required'),
  kitType: z.enum(['poster', 'brochure']),
  featuredImage: z.string().min(1, 'Image is required'),
  nameOrTitle: z.string().min(1, 'Name or title is required'),
  uploadedFile: z.string().min(1, 'File is required'),
});

export async function addMarketingKit(data: z.infer<typeof addMarketingKitSchema>) {
  const validation = addMarketingKitSchema.safeParse(data);
  if (!validation.success) {
    console.error('Validation errors:', validation.error.flatten());
    return { success: false, error: 'Invalid data submitted.' };
  }

  const { catalogCode, ...kitData } = validation.data;
  
  try {
    const catalogsRef = collection(db, 'catalogs');
    const q = query(catalogsRef, where('catalogCode', '==', catalogCode), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: `Catalog with code "${catalogCode}" not found.` };
    }

    const catalogDoc = querySnapshot.docs[0];
    const catalogData = catalogDoc.data() as Catalog;
    
    const placeholderImage = 'https://placehold.co/600x400.png';
    const placeholderFile = 'placeholder.pdf';
    const isBase64 = (str: string | undefined): boolean => !!str && str.startsWith('data:');

    const newKit: CatalogMarketingKit = {
      ...kitData,
      id: `MR${Math.random().toString().slice(2, 12)}`,
      featuredImage: isBase64(kitData.featuredImage) ? placeholderImage : kitData.featuredImage,
      uploadedFile: isBase64(kitData.uploadedFile) ? (kitData.uploadedFile.startsWith('data:image') ? placeholderImage : placeholderFile) : kitData.uploadedFile,
    };
    
    const updatedKits = [...(catalogData.marketingKits || []), newKit];

    await updateDoc(doc(db, 'catalogs', catalogDoc.id), {
      marketingKits: updatedKits
    });

    return { success: true, message: 'Marketing kit added successfully!' };
  } catch (error) {
    console.error('Error adding marketing kit:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function getCatalogById(id: string): Promise<Catalog | null> {
  try {
    const docRef = doc(db, 'catalogs', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Catalog;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting catalog by ID:", error);
    return null;
  }
}
