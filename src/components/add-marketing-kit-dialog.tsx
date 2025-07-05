
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { addMarketingKit } from '@/app/add-catalog/actions';

const marketingKitSchema = z.object({
  catalogCode: z.string().min(1, 'Catalog code is required'),
  kitType: z.enum(['poster', 'brochure']),
  featuredImage: z.string().min(1, 'Featured image is required'),
  nameOrTitle: z.string().min(1, 'Name or title is required'),
  uploadedFile: z.string().min(1, 'File is required'),
});

interface AddMarketingKitDialogProps {
  children: React.ReactNode;
  onKitAdded: () => void;
}

function FileUploadButton({ label, onFileSelect, previewUrl, hint, accept = "image/*" }: { label: string; onFileSelect: (base64: string) => void; previewUrl?: string | null; hint: string; accept?: string }) {
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
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-muted overflow-hidden">
          {previewUrl && previewUrl.startsWith('data:image') ? (
            <img src={previewUrl} alt={label} className="w-full h-full object-cover" data-ai-hint={hint} />
          ) : (
            <Upload className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Input type="file" ref={fileInputRef} className="hidden" accept={accept} onChange={handleFileChange} />
        </div>
      </div>
      <FormMessage />
    </FormItem>
  );
}

export default function AddMarketingKitDialog({ children, onKitAdded }: AddMarketingKitDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof marketingKitSchema>>({
    resolver: zodResolver(marketingKitSchema),
    defaultValues: {
      catalogCode: '',
      kitType: 'poster',
      featuredImage: '',
      nameOrTitle: '',
      uploadedFile: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof marketingKitSchema>) => {
    const result = await addMarketingKit(values);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      onKitAdded();
      setOpen(false);
      form.reset();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Marketing Kit</DialogTitle>
          <DialogDescription>Add a new poster or brochure to an existing catalog.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="add-kit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="catalogCode" render={({ field }) => (
              <FormItem>
                <FormLabel>Catalog Code</FormLabel>
                <FormControl><Input placeholder="e.g. CD123456" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="kitType" render={({ field }) => (
              <FormItem>
                <FormLabel>Kit Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="poster">Poster</SelectItem>
                    <SelectItem value="brochure">Brochure</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="nameOrTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Name or Title</FormLabel>
                <FormControl><Input placeholder="e.g. Summer Sale Poster" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="featuredImage" render={({ field }) => (
              <FileUploadButton label="Featured Image" onFileSelect={field.onChange} previewUrl={field.value} hint="marketing poster" />
            )} />
            <FormField control={form.control} name="uploadedFile" render={({ field }) => (
              <FileUploadButton label="Upload File (PDF/Image)" onFileSelect={field.onChange} previewUrl={field.value} hint="document" accept="image/*,application/pdf"/>
            )} />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
          <Button type="submit" form="add-kit-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Adding...' : 'Add Kit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
