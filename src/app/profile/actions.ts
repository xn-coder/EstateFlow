'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, addDoc, collection, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import * as z from 'zod';
import type { Role, User } from '@/types';
import bcrypt from 'bcryptjs';
import { ADMIN_ROLES } from '@/lib/roles';

// --- Update Profile Action ---
const profileUpdateSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

export async function updateUserProfile(userId: string, name: string, phone?: string, avatar?: string) {
  const validation = profileUpdateSchema.safeParse({ userId, name, phone, avatar });
  if (!validation.success) {
    return { success: false, error: 'Invalid input.' };
  }

  try {
    const userRef = doc(db, 'users', userId);
    const updateData: { name: string; phone: string | null; avatar?: string } = {
        name,
        phone: phone || null,
    };
    if (avatar) {
        updateData.avatar = avatar;
    }
    
    await updateDoc(userRef, updateData);

    const updatedDoc = await getDoc(userRef);
    if (!updatedDoc.exists()) {
        return { success: false, error: 'User not found after update.' };
    }
    const updatedData = updatedDoc.data();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = updatedData;

    const updatedUser: User = {
        id: updatedDoc.id,
        ...userWithoutPassword
    } as User;

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile.' };
  }
}

// --- Update Password Action ---
const passwordUpdateSchema = z.object({
    userId: z.string(),
    currentPassword: z.string(),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long.'),
});

export async function updateUserPassword(userId: string, currentPassword: string, newPassword: string) {
    const validation = passwordUpdateSchema.safeParse({ userId, currentPassword, newPassword });
    if (!validation.success) {
        return { success: false, error: 'Invalid input.' };
    }

    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return { success: false, error: 'User not found.' };
        }

        const user = userDoc.data() as User & { passwordHash: string };
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isPasswordValid) {
            return { success: false, error: 'Incorrect current password.' };
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await updateDoc(userRef, { passwordHash: newPasswordHash });

        return { success: true, message: 'Password updated successfully.' };
    } catch (error) {
        console.error('Error updating password:', error);
        return { success: false, error: 'Failed to update password.' };
    }
}

// --- Add User Action ---
const addUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  role: z.enum(ADMIN_ROLES as [string, ...string[]]),
  avatar: z.string().optional(),
});


export async function addUser(userData: z.infer<typeof addUserSchema>) {
    const validation = addUserSchema.safeParse(userData);
    if (!validation.success) {
        return { success: false, error: 'Invalid user data.' };
    }
    
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', userData.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return { success: false, error: 'A user with this email already exists.' };
        }

        const passwordHash = await bcrypt.hash(userData.password, 10);
        await addDoc(collection(db, 'users'), {
            name: userData.name,
            email: userData.email,
            phone: userData.phone || null,
            role: userData.role,
            passwordHash: passwordHash,
            avatar: userData.avatar || `https://placehold.co/40x40.png`,
            status: 'Active',
        });

        return { success: true, message: 'User added successfully.' };
    } catch (error) {
        console.error('Error adding user:', error);
        return { success: false, error: 'Failed to add user.' };
    }
}


// --- Delete User Action ---
const deleteUserSchema = z.object({
    userId: z.string(),
});

export async function deleteUser(userId: string) {
    const validation = deleteUserSchema.safeParse({ userId });
    if (!validation.success) {
        return { success: false, error: 'Invalid input.' };
    }

    try {
        await deleteDoc(doc(db, 'users', userId));
        return { success: true, message: 'User deleted successfully.' };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'Failed to delete user.' };
    }
}

// --- Edit User by Admin Action ---
const editUserSchema = z.object({
  userId: z.string(),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  role: z.enum(ADMIN_ROLES as [string, ...string[]]),
  avatar: z.string().optional(),
});

export async function editUser(userData: z.infer<typeof editUserSchema>) {
  const validation = editUserSchema.safeParse(userData);
  if (!validation.success) {
    return { success: false, error: 'Invalid user data.' };
  }

  try {
    const userRef = doc(db, 'users', userData.userId);
    const updateData: { name: string; phone: string | null; role: Role; avatar?: string } = {
      name: userData.name,
      phone: userData.phone || null,
      role: userData.role,
    };

    if (userData.avatar) {
      updateData.avatar = userData.avatar;
    }

    await updateDoc(userRef, updateData);
    return { success: true, message: 'User updated successfully.' };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'Failed to update user.' };
  }
}
