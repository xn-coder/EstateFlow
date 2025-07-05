'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';
import type { Role, User } from '@/types';
import { editUser } from '@/app/profile/actions';
import { useToast } from '@/hooks/use-toast';
import { ADMIN_ROLES } from '@/lib/roles';

const userRoles = ADMIN_ROLES;

const editUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(userRoles as [string, ...string[]]),
});

interface EditUserDialogProps {
  children: React.ReactNode;
  user: User;
  onUserUpdated: () => void;
}

export default function EditUserDialog({ children, user, onUserUpdated }: EditUserDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(user.avatar);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const nameParts = user.name.split(' ');

  const form = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      phone: user.phone || '',
      role: user.role,
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof editUserSchema>) => {
    setIsSubmitting(true);
    const result = await editUser({
      userId: user.id,
      name: `${values.firstName} ${values.lastName}`,
      phone: values.phone,
      role: values.role,
      avatar: avatarPreview || undefined,
    });

    if (result.success) {
      toast({ title: 'Success', description: result.message });
      onUserUpdated();
      setOpen(false);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setIsSubmitting(false);
  };
  
  React.useEffect(() => {
    if (open) {
      const nameParts = user.name.split(' ');
      form.reset({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: user.phone || '',
        role: user.role,
      });
      setAvatarPreview(user.avatar);
    }
  }, [open, user, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Make changes to {user.name}'s profile.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6">
            <Form {...form}>
            <form id="edit-user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Avatar className="h-24 w-24 border">
                    <AvatarImage src={avatarPreview || ''} alt={user.name} />
                    <AvatarFallback>
                        {user.name.substring(0,2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="relative">
                    <Button type="button" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Change Image
                    </Button>
                    <Input
                    type="file"
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={handleAvatarChange}
                    accept="image/*"
                    />
                </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                        <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                        <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input type="email" value={user.email} readOnly disabled />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select access level" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {userRoles.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
            </Form>
        </div>
        <DialogFooter className="p-6 pt-4 border-t bg-background">
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="edit-user-form" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
