'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import * as z from 'zod';
import type { SupportTicket, User } from '@/types';

const supportTicketSchema = z.object({
  queryCategory: z.string().min(1, 'Query category is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  user: z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
  }),
});

export async function addSupportTicket(data: Omit<SupportTicket, 'id' | 'ticketId' | 'createdAt' | 'status' | 'userType' | 'userId' | 'userName'> & { user: Pick<User, 'id' | 'name' | 'role'> }) {
    const validation = supportTicketSchema.safeParse(data);
    if (!validation.success) {
        console.error('Validation errors:', validation.error.flatten());
        return { success: false, error: 'Invalid data submitted.' };
    }

    try {
        const ticketId = `TID-${Math.floor(100000 + Math.random() * 900000)}`;
        const dataToSave: Omit<SupportTicket, 'id'> = {
            ...validation.data,
            ticketId,
            createdAt: new Date().toISOString(),
            status: 'Latest',
            userId: data.user.id,
            userName: data.user.name,
            userType: data.user.role as User['role'],
        };

        await addDoc(collection(db, 'supportTickets'), dataToSave);
        return { success: true, message: 'Support ticket submitted successfully!' };

    } catch (error) {
        console.error('Error submitting ticket:', error);
        return { success: false, error: 'Failed to submit ticket.' };
    }
}


export async function getSupportTickets(): Promise<SupportTicket[]> {
  try {
    const ticketsRef = collection(db, 'supportTickets');
    const q = query(ticketsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportTicket));
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return [];
  }
}
