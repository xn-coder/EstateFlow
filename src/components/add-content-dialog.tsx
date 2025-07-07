
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
import { addContent } from '@/app/manage-content/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Category } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const contentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  categoryId: z.string().min(1, 'Category is required'),
  featuredImage: z.string().min(1, 'Featured image is required'),
  catalogCode: z.string().optional(),
  contentType: z.enum(['Article', 'Video', 'FAQs']),
});

interface AddContentDialogProps {
  children: React.ReactNode;
  categories: Category[];
  onContentAdded: () => void;
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

export default function AddContentDialog({ children, categories, onContentAdded }: AddContentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const form = useForm<z.infer<typeof contentSchema>>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: '',
      categoryId: '',
      featuredImage: '',
      catalogCode: '',
      contentType: 'Article',
    },
  });

  const onSubmit = async (values: z.infer<typeof contentSchema>) => {
    const selectedCategory = categories.find(c => c.id === values.categoryId);
    if (!selectedCategory) {
        toast({ title: 'Error', description: 'Invalid category selected.', variant: 'destructive' });
        return;
    }
    
    const sellerId = currentUser?.role === 'Seller' ? currentUser.id : undefined;
    const result = await addContent(
      {
        ...values,
        categoryName: selectedCategory.name,
      },
      sellerId
    );
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      onContentAdded();
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
          <DialogTitle>Add New Content</DialogTitle>
          <DialogDescription>Create a new article, video, or FAQ entry.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="add-content-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Content title" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="featuredImage" render={({ field }) => (<FileUpload onFileSelect={field.onChange} previewUrl={field.value} hint="content image" />)} />
            <FormField control={form.control} name="catalogCode" render={({ field }) => (<FormItem><FormLabel>Catalog Code (Optional)</FormLabel><FormControl><Input placeholder="e.g. CD123456" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Content Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Article">Article</SelectItem>
                      <SelectItem value="Video">Video</SelectItem>
                      <SelectItem value="FAQs">FAQs</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
          <Button type="submit" form="add-content-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Adding...' : 'Add Content'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
