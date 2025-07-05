
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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
import { websiteData } from '@/lib/website-data';
import { Upload, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const slideshowItemSchema = z.object({
  id: z.string(),
  image: z.any().describe('The slideshow image'),
  title: z.string().min(1, 'Title is required'),
  link: z.string().url('Must be a valid URL or a hash link like #').or(z.string().startsWith('#')),
});

const slideshowSchema = z.object({
  slideshows: z.array(slideshowItemSchema),
});

interface EditSlideshowDialogProps {
  children: React.ReactNode;
}

export default function EditSlideshowDialog({ children }: EditSlideshowDialogProps) {
  const [open, setOpen] = React.useState(false);
  
  const form = useForm<z.infer<typeof slideshowSchema>>({
    resolver: zodResolver(slideshowSchema),
    defaultValues: {
      slideshows: websiteData.slideshows,
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'slideshows',
  });

  const [imagePreviews, setImagePreviews] = React.useState<Record<string, string>>({});
  
  React.useEffect(() => {
    const initialPreviews: Record<string, string> = {};
    fields.forEach((field, index) => {
      // @ts-ignore
      const imageUrl = websiteData.slideshows[index]?.image;
      if (typeof imageUrl === 'string') {
        initialPreviews[field.id] = imageUrl;
      }
    });
    setImagePreviews(initialPreviews);
  }, [fields, open]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (file: File | null) => void, fieldId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({...prev, [fieldId]: reader.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSlideshow = () => {
    append({ id: `slide${Date.now()}`, image: null, title: 'New Slide', link: '#' });
  };
  
  const onSubmit = (values: z.infer<typeof slideshowSchema>) => {
    console.log('Slideshows updated:', values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Slideshow</DialogTitle>
          <DialogDescription>Manage your website's slideshow images, titles, and links.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-96 pr-6">
                <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-full sm:w-1/3">
                                <FormLabel>Image</FormLabel>
                                <div className="mt-2 aspect-video w-full rounded-md border flex items-center justify-center bg-muted overflow-hidden">
                                    {imagePreviews[field.id] ? (
                                        <Image src={imagePreviews[field.id]} alt="Slideshow preview" width={160} height={90} className="object-cover w-full h-full" data-ai-hint="presentation slide" />
                                    ) : (
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                <Controller
                                    control={form.control}
                                    name={`slideshows.${index}.image`}
                                    render={({ field: { onChange, value, ...rest } }) => (
                                      <div className="relative mt-2">
                                        <Button type="button" variant="outline" size="sm" className="w-full">
                                            <Upload className="mr-2 h-4 w-4" /> Upload
                                        </Button>
                                        <Input
                                            type="file"
                                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                            onChange={(e) => handleImageChange(e, onChange, field.id)}
                                            accept="image/*"
                                            {...rest}
                                        />
                                      </div>
                                    )}
                                />
                            </div>
                            <div className="w-full sm:w-2/3 space-y-2">
                                <FormField
                                    control={form.control}
                                    name={`slideshows.${index}.title`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                        <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`slideshows.${index}.link`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Link</FormLabel>
                                        <FormControl>
                                        <Input {...field} placeholder="https://example.com" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        {fields.length > 1 && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => remove(index)}
                                className="absolute top-2 right-2 h-6 w-6"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
                </div>
            </ScrollArea>

            <Button type="button" variant="outline" onClick={addSlideshow} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add More Slideshows
            </Button>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
