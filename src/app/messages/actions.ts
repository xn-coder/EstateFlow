
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import * as z from 'zod';
import type { User } from '@/types';

const directMessageSchema = z.object({
  recipientId: z.string(),
  recipientName: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  subject: z.string().min(1, 'Subject is required.'),
  details: z.string().min(1, 'Details are required.'),
  attachment: z.string().optional(),
});

export async function sendDirectMessage(data: z.infer<typeof directMessageSchema>) {
  const validation = directMessageSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Invalid data submitted.' };
  }

  try {
    const messageData = {
      ...validation.data,
      createdAt: new Date().toISOString(),
      read: false,
    };
    await addDoc(collection(db, 'messages'), messageData);
    return { success: true, message: 'Message sent successfully!' };
  } catch (error) {
    console.error('Error sending message:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
