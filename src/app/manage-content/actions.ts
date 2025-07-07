
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import * as z from 'zod';
import type { ContentItem } from '@/types';

const contentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  categoryId: z.string().min(1, 'Category is required'),
  categoryName: z.string().min(1),
  featuredImage: z.string().min(1, 'Featured image is required'),
  catalogCode: z.string().optional(),
  contentType: z.enum(['Article', 'Video', 'FAQs']),
});

export async function addContent(data: Omit<ContentItem, 'id' | 'contentCode'>) {
  const validation = contentSchema.safeParse(data);
  if (!validation.success) {
    console.error('Validation errors:', validation.error.flatten());
    return { success: false, error: 'Invalid data submitted.' };
  }
  
  // To prevent storing large base64 strings, we'll use a placeholder.
  const dataToSave = {
    ...validation.data,
    featuredImage: data.featuredImage.startsWith('data:') ? 'https://placehold.co/600x400.png' : data.featuredImage,
    contentCode: `CN${Math.random().toString().slice(2, 11)}`,
  };

  try {
    await addDoc(collection(db, 'content'), dataToSave);
    return { success: true, message: 'Content added successfully!' };
  } catch (error) {
    console.error('Error adding content:', error);
    return { success: false, error: 'Failed to add content.' };
  }
}

export async function getContent(): Promise<ContentItem[]> {
  try {
    const snapshot = await getDocs(collection(db, 'content'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentItem));
  } catch (error) {
    console.error("Error fetching content:", error);
    return [];
  }
}

export async function deleteContent(id: string): Promise<{ success: boolean, error?: string }> {
  try {
    await deleteDoc(doc(db, 'content', id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting content:", error);
    return { success: false, error: 'Failed to delete content.' };
  }
}
