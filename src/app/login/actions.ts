
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, writeBatch, doc } from 'firebase/firestore';
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

    // Auto-create admin user if it doesn't exist, using credentials from .env.local
    if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) {
      const adminQuery = query(usersRef, where('email', '==', email));
      const adminSnapshot = await getDocs(adminQuery);
      if (adminSnapshot.empty) {
        console.log(`Admin user ${email} not found, creating from .env credentials.`);
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
          throw new Error('ADMIN_PASSWORD is not set in the .env.local file.');
        }
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        await addDoc(usersRef, {
          name: 'Super Admin',
          email: email,
          role: 'Admin',
          avatar: 'https://placehold.co/40x40.png',
          passwordHash: passwordHash,
          status: 'Active',
          userCode: `US${Math.random().toString().slice(2, 12)}`,
        });
        console.log('Admin user created. You can now log in with the credentials from .env.local.');
      }
    }

    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const userDoc = querySnapshot.docs[0];
    const user = userDoc.data() as User & { passwordHash: string };

    if (user.status === 'Pending') {
      return { success: false, error: 'Your account is pending activation by an administrator.' };
    }

    if (user.status === 'Deactivated') {
      return { success: false, error: 'Your account has been deactivated. Please contact an administrator.' };
    }

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
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function seedUsers() {
  try {
    const usersRef = collection(db, 'users');
    const batch = writeBatch(db);
    let usersSeededCount = 0;

    for (const user of initialUsersForSeed) {
      const q = query(usersRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const passwordHash = await bcrypt.hash('password', 10);
        const userDocRef = doc(usersRef);
        const { id, ...userData } = user;

        batch.set(userDocRef, {
          ...userData,
          passwordHash: passwordHash,
          status: 'Active',
        });
        usersSeededCount++;
      }
    }

    if (usersSeededCount > 0) {
      await batch.commit();
      return { success: true, message: `Successfully seeded ${usersSeededCount} users.` };
    } else {
      return { success: true, message: 'All initial users already exist.' };
    }
  } catch (error) {
    console.error("Seeding error:", error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred during seeding." };
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
