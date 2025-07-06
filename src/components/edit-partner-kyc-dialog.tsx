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
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updatePartnerKycDetails } from '@/app/profile/actions';
import type { PartnerActivationInfo } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const partnerKycSchema = z.object({
    aadhaarCard: z.string().min(1, 'Aadhaar card is required'),
    panCard: z.string().min(1, 'PAN card is required'),
});

interface EditPartnerKycDialogProps {
  children: React.ReactNode;
  partnerInfo: PartnerActivationInfo;
  onUpdate: () => void;
}

function FileUploadPreview({ label, base64Image, hint, onFileSelect }: { label: string; base64Image?: string; hint: string, onFileSelect: (base64: string) => void }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
        <CardHeader className='pb-2'>
            <CardTitle className="text-base">{label}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-4 gap-4">
          {base64Image ? (
            <img src={base64Image} alt={label} className="rounded-lg border max-w-full h-auto max-h-32 object-contain" data-ai-hint={hint} />
          ) : (
            <div className="text-sm text-center border-dashed border-2 rounded-lg p-8 bg-muted w-full h-32 flex items-center justify-center">No Image Uploaded</div>
          )}
          <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload New
          </Button>
          <Input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
        </CardContent>
    </Card>
  );
};


export default function EditPartnerKycDialog({ children, partnerInfo, onUpdate }: EditPartnerKycDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { profile } = partnerInfo;

  const form = useForm<z.infer<typeof partnerKycSchema>>({
    resolver: zodResolver(partnerKycSchema),
    defaultValues: {
      aadhaarCard: profile.aadhaarCard,
      panCard: profile.panCard,
    },
  });
  
  const aadhaarPreview = form.watch('aadhaarCard');
  const panPreview = form.watch('panCard');

  React.useEffect(() => {
    if (open) {
      form.reset({
        aadhaarCard: profile.aadhaarCard,
        panCard: profile.panCard,
      });
    }
  }, [open, profile, form]);

  const onSubmit = async (values: z.infer<typeof partnerKycSchema>) => {
    const result = await updatePartnerKycDetails(profile.id, values);
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
          <DialogTitle>Edit KYC Details</DialogTitle>
          <DialogDescription>Update your KYC documents.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="aadhaarCard"
              render={({ field }) => (
                <FormItem>
                  <FileUploadPreview label="Aadhaar Card" hint="identification card" base64Image={aadhaarPreview} onFileSelect={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="panCard"
              render={({ field }) => (
                <FormItem>
                  <FileUploadPreview label="PAN Card" hint="identification card" base64Image={panPreview} onFileSelect={field.onChange} />
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
