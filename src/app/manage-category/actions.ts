
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import * as z from 'zod';
import type { Category } from '@/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  imageUrl: z.string().min(1, 'Featured image is required'),
  url: z.string().url('Must be a valid URL'),
});

export async function addCategory(data: Omit<Category, 'id'>) {
  const validation = categorySchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Invalid data submitted.' };
  }

  // To prevent storing large base64 strings, we'll use a placeholder.
  // In a real app, you would upload to a service like Firebase Storage and store the URL.
  const dataToSave = {
    ...validation.data,
    imageUrl: data.imageUrl.startsWith('data:') ? 'https://placehold.co/600x400.png' : data.imageUrl,
  };

  try {
    await addDoc(collection(db, 'categories'), dataToSave);
    return { success: true, message: 'Category added successfully!' };
  } catch (error) {
    console.error('Error adding category:', error);
    return { success: false, error: 'Failed to add category.' };
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, 'categories', id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: 'Failed to delete category.' };
  }
}
