
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { subYears, parseISO } from 'date-fns';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updatePartnerPersonalDetails } from '@/app/profile/actions';
import type { PartnerActivationInfo } from '@/types';
import { qualifications } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const partnerPersonalDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dob: z.date(),
  gender: z.enum(['Male', 'Female', 'Other']),
  qualification: z.enum(qualifications),
  profileImage: z.string().optional(),
});

interface EditPartnerPersonalDialogProps {
  children: React.ReactNode;
  partnerInfo: PartnerActivationInfo;
  onUpdate: () => void;
}

const eighteenYearsAgo = subYears(new Date(), 18);
const oneHundredYearsAgo = subYears(new Date(), 100);

export default function EditPartnerPersonalDialog({ children, partnerInfo, onUpdate }: EditPartnerPersonalDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { user, profile } = partnerInfo;

  const form = useForm<z.infer<typeof partnerPersonalDetailsSchema>>({
    resolver: zodResolver(partnerPersonalDetailsSchema),
    defaultValues: {
      name: profile.name,
      dob: parseISO(profile.dob),
      gender: profile.gender,
      qualification: profile.qualification,
      profileImage: profile.profileImage || user.avatar,
    },
  });
  
  const profileImagePreview = form.watch('profileImage');
  
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: profile.name,
        dob: parseISO(profile.dob),
        gender: profile.gender,
        qualification: profile.qualification,
        profileImage: profile.profileImage || user.avatar,
      });
    }
  }, [open, profile, user, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('profileImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof partnerPersonalDetailsSchema>) => {
    const result = await updatePartnerPersonalDetails(profile.id, user.id, values);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      onUpdate();
      setOpen(false);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Personal Details</DialogTitle>
          <DialogDescription>Update your personal information.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
                <Avatar className="h-24 w-24 border">
                    <AvatarImage src={profileImagePreview} alt={profile.name} />
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="relative">
                    <Button type="button" variant="outline"><Upload className="mr-2 h-4 w-4" />Upload Image</Button>
                    <Input type="file" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={handleImageChange} accept="image/*" />
                </div>
            </div>
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="dob" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><Popover>
                <PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button></FormControl></PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-buttons" fromYear={oneHundredYearsAgo.getFullYear()} toYear={eighteenYearsAgo.getFullYear()} disabled={(date) => date > eighteenYearsAgo || date < oneHundredYearsAgo} initialFocus />
                </PopoverContent>
                </Popover><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                </Select><FormMessage /></FormItem>
            )} />
            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select qualification" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {qualifications.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
