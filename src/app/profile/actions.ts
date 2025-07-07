
'use server';

import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, addDoc, collection, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import * as z from 'zod';
import type { Role, User } from '@/types';
import { qualifications } from '@/types';
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
    const updateData: { name: string; phone?: string | null; avatar?: string } = {
        name,
    };
    if (phone) {
        updateData.phone = phone;
    }
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
            userCode: `US${Math.random().toString().slice(2, 12)}`,
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


// --- Partner Profile Update Actions ---

const partnerPersonalDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dob: z.date(),
  gender: z.enum(['Male', 'Female', 'Other']),
  qualification: z.enum(qualifications),
  profileImage: z.string().optional(),
});
export async function updatePartnerPersonalDetails(partnerProfileId: string, userId: string, data: z.infer<typeof partnerPersonalDetailsSchema>) {
  const validation = partnerPersonalDetailsSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data.' };

  try {
    const profileRef = doc(db, 'partnerProfiles', partnerProfileId);
    await updateDoc(profileRef, {
      name: data.name,
      dob: data.dob.toISOString(),
      gender: data.gender,
      qualification: data.qualification,
      profileImage: data.profileImage,
    });
    
    // Also update name and avatar in user document
    await updateUserProfile(userId, data.name, undefined, data.profileImage);
    
    return { success: true, message: 'Personal details updated.' };
  } catch (error) {
    console.error('Error updating personal details:', error);
    return { success: false, error: 'Failed to update details.' };
  }
}

const partnerContactDetailsSchema = z.object({
  phone: z.string().min(10, 'A valid phone number is required'),
  whatsapp: z.string().min(10, 'A valid WhatsApp number is required'),
});
export async function updatePartnerContactDetails(partnerProfileId: string, userId: string, data: z.infer<typeof partnerContactDetailsSchema>) {
  const validation = partnerContactDetailsSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data.' };
  
  try {
    const profileRef = doc(db, 'partnerProfiles', partnerProfileId);
    await updateDoc(profileRef, {
      phone: data.phone,
      whatsapp: data.whatsapp,
    });

    // Also update phone in user document
    await updateUserProfile(userId, '', data.phone);

    return { success: true, message: 'Contact details updated.' };
  } catch (error) {
    console.error('Error updating contact details:', error);
    return { success: false, error: 'Failed to update details.' };
  }
}

const partnerAddressDetailsSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'A valid pin code is required'),
  country: z.string().min(1, 'Country is required'),
});
export async function updatePartnerAddressDetails(partnerProfileId: string, data: z.infer<typeof partnerAddressDetailsSchema>) {
    const validation = partnerAddressDetailsSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'Invalid data.' };

    try {
        const profileRef = doc(db, 'partnerProfiles', partnerProfileId);
        await updateDoc(profileRef, data);
        return { success: true, message: 'Address details updated.' };
    } catch (error) {
        console.error('Error updating address details:', error);
        return { success: false, error: 'Failed to update details.' };
    }
}

const partnerKycSchema = z.object({
    aadhaarCard: z.string().min(1, 'Aadhaar card is required'),
    aadhaarNumber: z.string().length(12, 'Aadhaar must be 12 digits.'),
    panCard: z.string().min(1, 'PAN card is required'),
    panNumber: z.string().length(10, 'PAN must be 10 characters.'),
});
export async function updatePartnerKycDetails(partnerProfileId: string, data: z.infer<typeof partnerKycSchema>) {
    const validation = partnerKycSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'Invalid data.' };

    try {
        const profileRef = doc(db, 'partnerProfiles', partnerProfileId);
        await updateDoc(profileRef, data);
        return { success: true, message: 'KYC documents updated.' };
    } catch (error) {
        console.error('Error updating KYC details:', error);
        return { success: false, error: 'Failed to update details.' };
    }
}

const partnerBusinessDetailsSchema = z.object({
  businessType: z.string().min(1),
  gstn: z.string().optional(),
  businessAge: z.coerce.number().min(0),
  areaCovered: z.string().min(1),
});
export async function updatePartnerBusinessDetails(partnerProfileId: string, data: z.infer<typeof partnerBusinessDetailsSchema>) {
  const validation = partnerBusinessDetailsSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data.' };

  try {
    const profileRef = doc(db, 'partnerProfiles', partnerProfileId);
    await updateDoc(profileRef, data);
    return { success: true, message: 'Business details updated.' };
  } catch (error) {
    console.error('Error updating business details:', error);
    return { success: false, error: 'Failed to update details.' };
  }
}

const partnerBusinessLogoSchema = z.object({
  businessLogo: z.string().optional(),
});
export async function updatePartnerBusinessLogo(partnerProfileId: string, data: z.infer<typeof partnerBusinessLogoSchema>) {
  const validation = partnerBusinessLogoSchema.safeParse(data);
  if (!validation.success) return { success: false, error: 'Invalid data.' };

  try {
    const profileRef = doc(db, 'partnerProfiles', partnerProfileId);
    await updateDoc(profileRef, {
        businessLogo: data.businessLogo,
    });
    return { success: true, message: 'Business logo updated.' };
  } catch (error) {
    console.error('Error updating business logo:', error);
    return { success: false, error: 'Failed to update logo.' };
  }
}

const partnerDigitalCardSchema = z.object({
    position: z.string().optional(),
});
export async function updatePartnerDigitalCard(partnerProfileId: string, data: z.infer<typeof partnerDigitalCardSchema>) {
    const validation = partnerDigitalCardSchema.safeParse(data);
    if (!validation.success) return { success: false, error: 'Invalid data.' };

    try {
        const profileRef = doc(db, 'partnerProfiles', partnerProfileId);
        await updateDoc(profileRef, {
            position: data.position,
        });
        return { success: true, message: 'Digital card updated.' };
    } catch (error) {
        console.error('Error updating digital card:', error);
        return { success: false, error: 'Failed to update details.' };
    }
}
