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
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updatePartnerBusinessLogo } from '@/app/profile/actions';
import type { PartnerActivationInfo } from '@/types';
import Image from 'next/image';

const partnerBusinessLogoSchema = z.object({
  businessLogo: z.string().optional(),
});

interface EditPartnerBusinessLogoDialogProps {
  children: React.ReactNode;
  partnerInfo: PartnerActivationInfo;
  onUpdate: () => void;
}

export default function EditPartnerBusinessLogoDialog({ children, partnerInfo, onUpdate }: EditPartnerBusinessLogoDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { profile } = partnerInfo;

  const form = useForm<z.infer<typeof partnerBusinessLogoSchema>>({
    resolver: zodResolver(partnerBusinessLogoSchema),
    defaultValues: {
      businessLogo: profile.businessLogo,
    },
  });
  
  const logoPreview = form.watch('businessLogo');

  React.useEffect(() => {
    if (open) {
      form.reset({
        businessLogo: profile.businessLogo,
      });
    }
  }, [open, profile, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        form.setValue('businessLogo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof partnerBusinessLogoSchema>) => {
    const result = await updatePartnerBusinessLogo(profile.id, values);
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
          <DialogTitle>Edit Business Logo</DialogTitle>
          <DialogDescription>Upload a new logo for your business.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="businessLogo"
              render={({ field }) => (
                <FormItem>
                    <div className="flex flex-col items-center gap-4">
                        <Image src={logoPreview || "https://placehold.co/128x128.png"} alt="Business Logo" width={128} height={128} className="rounded-lg border" data-ai-hint="company logo" />
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
