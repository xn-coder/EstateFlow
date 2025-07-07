
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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

export async function getSupportTicketById(id: string): Promise<SupportTicket | null> {
    try {
        const docRef = doc(db, 'supportTickets', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as SupportTicket;
        }
        return null;
    } catch (error) {
        console.error("Error fetching ticket by ID:", error);
        return null;
    }
}

const updateTicketSchema = z.object({
    ticketId: z.string(),
    status: z.enum(['Latest', 'Processing', 'Solved']),
    resolutionData: z.object({
        resolvedAt: z.string().optional(),
        resolvedBy: z.string().optional(),
        feedback: z.string().optional(),
        resolutionDetails: z.string().optional(),
    }).optional(),
});


export async function updateTicketStatus(data: z.infer<typeof updateTicketSchema>) {
    const validation = updateTicketSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: 'Invalid data.' };
    }

    const { ticketId, status, resolutionData } = validation.data;

    try {
        const ticketRef = doc(db, 'supportTickets', ticketId);
        const updateData: Partial<SupportTicket> = { status };

        if (status === 'Solved' && resolutionData) {
            Object.assign(updateData, resolutionData);
        }

        await updateDoc(ticketRef, updateData);
        return { success: true };
    } catch (error) {
        console.error("Error updating ticket status:", error);
        return { success: false, error: 'Failed to update ticket.' };
    }
}

export async function deleteSupportTicket(ticketId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, 'supportTickets', ticketId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting support ticket:", error);
    return { success: false, error: 'Failed to delete ticket.' };
  }
}
