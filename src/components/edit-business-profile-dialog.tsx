
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
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload } from 'lucide-react';
import { updateBusinessInfo } from '@/app/manage-website/actions';
import { useToast } from '@/hooks/use-toast';
import type { WebsiteData } from '@/types';
import { ScrollArea } from './ui/scroll-area';

const businessProfileSchema = z.object({
  name: z.string().min(1, 'Website title is required'),
  tagline: z.string().optional(),
  metaKeywords: z.string().optional(),
  metaDescription: z.string().optional(),
  avatar: z.string(),
});

interface EditBusinessProfileDialogProps {
  children: React.ReactNode;
  businessInfo: WebsiteData['businessInfo'];
  onUpdate: () => void;
}

export default function EditBusinessProfileDialog({ children, businessInfo, onUpdate }: EditBusinessProfileDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(businessInfo.avatar);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof businessProfileSchema>>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      name: businessInfo.name,
      tagline: businessInfo.tagline,
      metaKeywords: businessInfo.metaKeywords || '',
      metaDescription: businessInfo.metaDescription || '',
      avatar: businessInfo.avatar,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: businessInfo.name,
        tagline: businessInfo.tagline,
        metaKeywords: businessInfo.metaKeywords || '',
        metaDescription: businessInfo.metaDescription || '',
        avatar: businessInfo.avatar,
      });
      setLogoPreview(businessInfo.avatar);
    }
  }, [open, businessInfo, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        form.setValue('avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof businessProfileSchema>) => {
    const result = await updateBusinessInfo(values);
    if (result.success) {
      toast({ title: 'Success', description: 'Business profile updated successfully.' });
      onUpdate();
      setOpen(false);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Edit Business Profile</DialogTitle>
          <DialogDescription>Update your business information and website SEO settings.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1">
            <div className="p-6">
                <Form {...form}>
                <form id="edit-business-profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Avatar className="h-24 w-24 border">
                        <AvatarImage src={logoPreview || ''} alt="Business Logo" />
                        <AvatarFallback>{businessInfo.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="relative">
                        <Button type="button" variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Logo
                        </Button>
                        <Input
                        type="file"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        onChange={handleLogoChange}
                        accept="image/*"
                        />
                    </div>
                    </div>
                    
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Website Title</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Website Tagline</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="metaKeywords"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Website Meta Keywords</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="e.g., keyword1, keyword2" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Website Meta Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </form>
                </Form>
            </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t bg-background">
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="edit-business-profile-form">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
