
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
import { addCategory } from '@/app/manage-category/actions';
import { useAuth } from '@/hooks/useAuth';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  imageUrl: z.string().min(1, 'Featured image is required'),
  url: z.string().url('Must be a valid URL'),
});

interface AddCategoryDialogProps {
  children: React.ReactNode;
  onCategoryAdded: () => void;
}

function FileUpload({ onFileSelect, previewUrl, hint }: { onFileSelect: (base64: string) => void; previewUrl?: string | null; hint: string }) {
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
      <FormLabel>Featured Image</FormLabel>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-muted overflow-hidden">
          {previewUrl ? (
            <img src={previewUrl} alt="Featured image" className="w-full h-full object-cover" data-ai-hint={hint} />
          ) : (
            <Upload className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
      </div>
      <FormMessage />
    </FormItem>
  );
}

export default function AddCategoryDialog({ children, onCategoryAdded }: AddCategoryDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      imageUrl: '',
      url: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    const sellerId = currentUser?.role === 'Seller' ? currentUser.id : undefined;
    const result = await addCategory(values, sellerId);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      onCategoryAdded();
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
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>Create a new category for your catalogs and content.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="add-category-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FileUpload onFileSelect={field.onChange} previewUrl={field.value} hint="category image" />
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Residential Properties" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/categories/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="add-category-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Adding...' : 'Add Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
