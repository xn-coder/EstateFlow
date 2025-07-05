"use client"

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Property, PropertyType } from '@/types';
import { propertyTypes } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(1, "Price must be a positive number."),
  location: z.string().min(3, "Location is required."),
  type: z.enum(propertyTypes, { required_error: "Property type is required." }),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  area: z.coerce.number().min(1, "Area must be a positive number."),
});

interface PropertyFormProps {
  children: React.ReactNode;
  property?: Property;
  onSave: (data: Property) => void;
}

export default function PropertyForm({ children, property, onSave }: PropertyFormProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: property?.title ?? '',
      description: property?.description ?? '',
      price: property?.price ?? 0,
      location: property?.location ?? '',
      type: property?.type,
      bedrooms: property?.features.bedrooms ?? 0,
      bathrooms: property?.features.bathrooms ?? 0,
      area: property?.features.area ?? 0,
    },
  });

  const handleDescriptionBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const description = e.target.value.toLowerCase();
    const detectedType = propertyTypes.find(type => description.includes(type.toLowerCase()));
    if (detectedType && form.getValues('type') !== detectedType) {
      form.setValue('type', detectedType);
      toast({
        title: "AI Assistant",
        description: `We've suggested '${detectedType}' based on your description.`,
      });
    }
  };

  const onSubmit = (values: z.infer<typeof propertySchema>) => {
    const newPropertyData: Property = {
      id: property?.id || `p${Date.now()}`,
      title: values.title,
      description: values.description,
      price: values.price,
      location: values.location,
      type: values.type,
      imageUrl: property?.imageUrl || 'https://placehold.co/600x400.png',
      agent: property?.agent || { name: 'Current User', avatar: 'https://placehold.co/40x40.png' },
      features: {
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        area: values.area,
      },
    };
    onSave(newPropertyData);
    toast({
      title: "Success!",
      description: `Property "${newPropertyData.title}" has been ${property ? 'updated' : 'created'}.`,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{property ? 'Edit Property' : 'Create New Property'}</DialogTitle>
          <DialogDescription>
            {property ? 'Update the details for this property.' : 'Fill in the details for the new property listing.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Modern Downtown Loft" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the property..." {...field} onBlur={handleDescriptionBlur} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 750000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Metropolis, USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a property type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {propertyTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-3 gap-4">
               <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area (sqft)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="bg-accent hover:bg-accent/90">{property ? 'Save Changes' : 'Create Property'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
