
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import * as z from 'zod';
import type { User, Message } from '@/types';
import { getUsers } from '@/app/login/actions';

const sendMessageSchema = z.object({
  type: z.enum(['announcement', 'partner', 'seller']),
  subject: z.string().min(1, 'Subject is required.'),
  details: z.string().min(1, 'Details are required.'),
  attachment: z.string().optional(),
  // Only for announcements
  announcementFor: z.enum(['partner', 'seller', 'both']).optional(),
  // Only for direct messages
  recipientId: z.string().optional(),
});


export async function sendMessage(data: z.infer<typeof sendMessageSchema>, sender: User) {
  const validation = sendMessageSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Invalid data submitted.' };
  }

  const { type, subject, details, attachment, announcementFor, recipientId } = validation.data;

  try {
    const messagesRef = collection(db, 'messages');
    const batch = writeBatch(db);
    
    if (type === 'announcement' && announcementFor) {
      const allUsers = await getUsers();
      let targetUsers: User[] = [];

      if (announcementFor === 'partner') {
        targetUsers = allUsers.filter(u => u.role === 'Partner');
      } else if (announcementFor === 'seller') {
        // This role doesn't exist but keeping for schema consistency
        targetUsers = allUsers.filter(u => u.role === 'Seller');
      } else if (announcementFor === 'both') {
        targetUsers = allUsers.filter(u => u.role === 'Partner' || u.role === 'Seller');
      }

      if (targetUsers.length === 0) {
        return { success: false, error: 'No recipients found for this announcement.' };
      }

      for (const recipient of targetUsers) {
        const messageDocRef = doc(messagesRef);
        batch.set(messageDocRef, {
            senderId: sender.id,
            senderName: sender.name,
            recipientId: recipient.id,
            recipientName: recipient.name,
            subject,
            details,
            attachment: attachment || null,
            createdAt: new Date().toISOString(),
            read: false,
        });
      }

    } else if ((type === 'partner' || type === 'seller') && recipientId) {
        const usersRef = collection(db, 'users');
        let q = query(usersRef, where('partnerCode', '==', recipientId));
        let userSnapshot = await getDocs(q);

        if (userSnapshot.empty) {
            // Fallback to checking by email if no partnerCode match
            q = query(usersRef, where('email', '==', recipientId));
            userSnapshot = await getDocs(q);
        }
        
        if (userSnapshot.empty) {
             return { success: false, error: `Recipient with ID or Email "${recipientId}" not found.` };
        }

        const userDoc = userSnapshot.docs[0];
        const recipient = userDoc.data() as User;
        
        const messageDocRef = doc(messagesRef);
        batch.set(messageDocRef, {
            senderId: sender.id,
            senderName: sender.name,
            recipientId: userDoc.id,
            recipientName: recipient.name,
            subject,
            details,
            attachment: attachment || null,
            createdAt: new Date().toISOString(),
            read: false,
        });

    } else {
        return { success: false, error: 'Invalid message type or missing recipient.' };
    }

    await batch.commit();
    return { success: true, message: 'Message sent successfully!' };

  } catch (error) {
    console.error('Error sending message:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function getMessages(userId: string): Promise<Message[]> {
    try {
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, where('recipientId', '==', userId), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    } catch (error) {
        console.error("Error fetching messages:", error);
        return [];
    }
}

export async function markMessageAsRead(messageId: string): Promise<{ success: boolean }> {
    try {
        const messageRef = doc(db, 'messages', messageId);
        await updateDoc(messageRef, { read: true });
        return { success: true };
    } catch (error) {
        console.error("Error marking message as read:", error);
        return { success: false };
    }
}
