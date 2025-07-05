'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, writeBatch } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import * as z from 'zod';
import type { User } from '@/types';
import { initialUsersForSeed } from '@/lib/data';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function loginUser(email: string, password: string) {
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return { success: false, error: 'Invalid input.' };
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data() as User & { passwordHash: string };

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    
    const userForClient: User = {
        ...userWithoutPassword,
        id: userDoc.id,
    }

    return { success: true, user: userForClient };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function seedUsers() {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // To prevent re-seeding, we can either throw an error or just return.
        // Throwing an error provides better feedback to the user.
        throw new Error("Users collection is not empty. Seeding aborted.");
    }
    
    const batch = writeBatch(db);
    
    for (const user of initialUsersForSeed) {
      // Use a default password for all seeded users for simplicity
      const passwordHash = await bcrypt.hash('password', 10);
      const userDocRef = doc(usersRef);
      // Omit id from the user object as Firestore will generate it.
      const { id, ...userData } = user;

      batch.set(userDocRef, {
        ...userData,
        passwordHash: passwordHash
      });
    }

    await batch.commit();

    return { success: true };
  } catch (error) {
    console.error("Seeding error:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unexpected error occurred during seeding.");
  }
}

// A helper function to fetch all users from firestore
export async function getUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Omit passwordHash before sending to client
        const { passwordHash, ...rest } = data;
        return {
            id: doc.id,
            ...rest
        } as User;
    });
  } catch (error) {
    console.error('Error fetching users: ', error);
    return [];
  }
}
