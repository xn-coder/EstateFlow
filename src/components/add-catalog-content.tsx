
'use client';

import * as React from 'react';
import { useForm, FormProvider, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { addCatalog } from '@/app/add-catalog/actions';
import { Checkbox } from './ui/checkbox';

// Schemas for each step
const step1Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  metaKeyword: z.string().optional(),
  mainCategory: z.string().min(1, 'Main category is required'),
  categoryName: z.string().min(1, 'Category name is required'),
  featuredImage: z.string().min(1, 'Featured image is required'),
});

const step2Schema = z.object({
  pricingType: z.enum(['INR', 'USD']),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be a positive number'),
  earningType: z.enum(['Fixed rate', 'commission', 'reward point']),
  earning: z.coerce.number().min(0, 'Earning must be a positive number'),
});

const step3Schema = z.object({
  slideshows: z.array(z.object({
    id: z.string(),
    image: z.string().min(1, 'Image is required'),
    title: z.string().min(1, 'Title is required'),
  })).min(1, 'At least one slideshow is required'),
});

const step4Schema = z.object({
  detailsContent: z.string().min(1, 'Details content is required'),
});

const step5Schema = z.object({
  faqs: z.array(z.object({
    id: z.string(),
    question: z.string().min(1, 'Question is required'),
    answer: z.string().min(1, 'Answer is required'),
  })).min(1, 'At least one FAQ is required'),
});

const step6Schema = z.object({
  galleryImages: z.array(z.string().min(1)).min(1, 'At least one gallery image is required'),
});

const step7Schema = z.object({
  videoLink: z.string().url('Must be a valid URL'),
});

const step8Schema = z.object({
  marketingKits: z.array(z.object({
    id: z.string(),
    kitType: z.enum(['poster', 'brochure']),
    featuredImage: z.string().min(1, 'Image is required'),
    nameOrTitle: z.string().min(1, 'Name or title is required'),
    uploadedFile: z.string().min(1, 'File is required'),
  })).min(1, 'At least one marketing kit is required'),
});

const step9Schema = z.object({
  writeNotes: z.boolean().default(false),
  notesContent: z.string().optional(),
  writeTerms: z.boolean().default(false),
  termsContent: z.string().optional(),
  writePolicy: z.boolean().default(false),
  policyContent: z.string().optional(),
});

const combinedSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema)
  .merge(step7Schema)
  .merge(step8Schema)
  .merge(step9Schema);

type FormValues = z.infer<typeof combinedSchema>;

const steps = [
  { id: 1, title: 'Catalog Details', schema: step1Schema },
  { id: 2, title: 'Share Earning Details', schema: step2Schema },
  { id: 3, title: 'Add Slideshow', schema: step3Schema },
  { id: 4, title: 'Write Details', schema: step4Schema },
  { id: 5, title: 'Write FAQs', schema: step5Schema },
  { id: 6, title: 'Upload Gallery Image', schema: step6Schema },
  { id: 7, title: 'Video Link', schema: step7Schema },
  { id: 8, title: 'Upload Marketing Materials', schema: step8Schema },
  { id: 9, title: 'Notes and Other Details', schema: step9Schema },
];

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className={cn("h-2 flex-1 rounded-full transition-colors",
          index < currentStep ? 'bg-primary' : 'bg-muted'
        )}></div>
      ))}
    </div>
  )
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
          {previewUrl ? (
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

export default function AddCatalogContent() {
  const [step, setStep] = React.useState(1);
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<FormValues>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      title: '',
      description: '',
      metaKeyword: '',
      mainCategory: '',
      categoryName: '',
      featuredImage: '',
      pricingType: 'INR',
      sellingPrice: 0,
      earningType: 'Fixed rate',
      earning: 0,
      slideshows: [{ id: 'slide1', image: '', title: '' }],
      detailsContent: '',
      faqs: [{ id: 'faq1', question: '', answer: '' }],
      galleryImages: [],
      videoLink: '',
      marketingKits: [{ id: 'kit1', kitType: 'poster', featuredImage: '', nameOrTitle: '', uploadedFile: '' }],
      writeNotes: false,
      notesContent: '',
      writeTerms: false,
      termsContent: '',
      writePolicy: false,
      policyContent: '',
    },
    mode: 'onChange'
  });

  const { trigger, handleSubmit, formState: { isSubmitting }, control } = methods;

  const { fields: slideshowFields, append: appendSlideshow, remove: removeSlideshow } = useFieldArray({ control, name: 'slideshows' });
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control, name: 'faqs' });
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({ control, name: 'galleryImages' });
  const { fields: marketingKitFields, append: appendMarketingKit, remove: removeMarketingKit } = useFieldArray({ control, name: 'marketingKits' });

  const watchedValues = useWatch({ control });

  const nextStep = async () => {
    const currentStepFields = Object.keys(steps[step - 1].schema.shape) as (keyof FormValues)[];
    const isValid = await trigger(currentStepFields);
    if (isValid) {
      if (step < steps.length) {
        setStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const onSubmit = async (data: FormValues) => {
    const result = await addCatalog(data);
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      router.push('/manage-business');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                 <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => router.push('/manage-business')}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Button>
                <div>
                  <CardTitle>Add Catalog</CardTitle>
                  <CardDescription>Step {step} of {steps.length}: {steps[step - 1].title}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StepIndicator currentStep={step} totalSteps={steps.length} />
              <ScrollArea className="h-[55vh] pr-6">
                <div className="space-y-6">
                  {step === 1 && (
                    <div className="space-y-4">
                      <FormField control={control} name="title" render={({ field }) => ( <FormItem><FormLabel>Title*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField control={control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description*</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField control={control} name="metaKeyword" render={({ field }) => ( <FormItem><FormLabel>Meta Keyword</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField control={control} name="mainCategory" render={({ field }) => ( <FormItem><FormLabel>Select Category*</FormLabel><FormControl><Input placeholder="Main Category" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={control} name="categoryName" render={({ field }) => ( <FormItem><FormLabel>&nbsp;</FormLabel><FormControl><Input placeholder="Category Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      </div>
                      <FormField control={control} name="featuredImage" render={({ field }) => ( <FileUploadButton label="Featured Image*" onFileSelect={field.onChange} previewUrl={field.value} hint="product image" /> )} />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                       <FormField control={control} name="pricingType" render={({ field }) => (
                          <FormItem><FormLabel>Pricing Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent><SelectItem value="INR">INR</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent>
                          </Select><FormMessage /></FormItem>
                        )} />
                      <FormField control={control} name="sellingPrice" render={({ field }) => ( <FormItem><FormLabel>Selling Price*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                      <FormField control={control} name="earningType" render={({ field }) => (
                          <FormItem><FormLabel>Earning Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="Fixed rate">Fixed rate</SelectItem>
                                <SelectItem value="commission">Commission</SelectItem>
                                <SelectItem value="reward point">Reward Point</SelectItem>
                              </SelectContent>
                          </Select><FormMessage /></FormItem>
                        )} />
                      <FormField control={control} name="earning" render={({ field }) => ( <FormItem><FormLabel>Earning*</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      {slideshowFields.map((field, index) => (
                        <Card key={field.id} className="p-4 relative">
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={control} name={`slideshows.${index}.image`} render={({ field }) => ( <FileUploadButton label="Slideshow Image*" onFileSelect={field.onChange} previewUrl={field.value} hint="presentation slide" /> )} />
                            <FormField control={control} name={`slideshows.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Slideshow Title*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                          </div>
                          {slideshowFields.length > 1 && ( <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeSlideshow(index)}><Trash2 className="h-4 w-4" /></Button> )}
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendSlideshow({ id: `slide${Date.now()}`, image: '', title: '' })}><Plus className="mr-2 h-4 w-4" /> Add More</Button>
                    </div>
                  )}

                  {step === 4 && (
                     <FormField control={control} name="detailsContent" render={({ field }) => ( <FormItem><FormLabel>Details</FormLabel><FormControl><Textarea className="min-h-64" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  )}
                  
                   {step === 5 && (
                    <div className="space-y-4">
                      {faqFields.map((field, index) => (
                        <Card key={field.id} className="p-4 relative">
                          <div className="space-y-2">
                             <FormField control={control} name={`faqs.${index}.question`} render={({ field }) => ( <FormItem><FormLabel>Question*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                             <FormField control={control} name={`faqs.${index}.answer`} render={({ field }) => ( <FormItem><FormLabel>Answer*</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                          </div>
                          {faqFields.length > 1 && ( <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeFaq(index)}><Trash2 className="h-4 w-4" /></Button> )}
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendFaq({ id: `faq${Date.now()}`, question: '', answer: '' })}><Plus className="mr-2 h-4 w-4" /> Add More</Button>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-4">
                        <FormLabel>Gallery Images*</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {galleryFields.map((field, index) => (
                                <div key={field.id} className="relative group">
                                    <FormField control={control} name={`galleryImages.${index}`} render={({ field }) => (
                                        <div className="w-full aspect-square border rounded-md flex items-center justify-center bg-muted overflow-hidden">
                                            {field.value ? (
                                                <img src={field.value} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover" data-ai-hint="product gallery" />
                                            ) : (
                                                <Upload className="text-muted-foreground" />
                                            )}
                                        </div>
                                    )} />
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeGallery(index)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                             <Button type="button" variant="outline" className="aspect-square" onClick={() => {
                                const fileInput = document.createElement('input');
                                fileInput.type = 'file';
                                fileInput.accept = 'image/*';
                                fileInput.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            appendGallery(reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                };
                                fileInput.click();
                            }}>
                                <Plus className="h-6 w-6" />
                            </Button>
                        </div>
                        <FormMessage>{methods.formState.errors.galleryImages?.message}</FormMessage>
                    </div>
                  )}
                  
                  {step === 7 && (
                     <FormField control={control} name="videoLink" render={({ field }) => ( <FormItem><FormLabel>Video Link*</FormLabel><FormControl><Input placeholder="https://youtube.com/watch?v=..." {...field} /></FormControl><FormMessage /></FormItem> )} />
                  )}

                  {step === 8 && (
                    <div className="space-y-4">
                      {marketingKitFields.map((field, index) => (
                        <Card key={field.id} className="p-4 relative">
                          <div className="space-y-4">
                             <FormField control={control} name={`marketingKits.${index}.kitType`} render={({ field }) => (
                                <FormItem><FormLabel>Kit Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent><SelectItem value="poster">Poster</SelectItem><SelectItem value="brochure">Brochure</SelectItem></SelectContent>
                                </Select><FormMessage /></FormItem>
                              )} />
                            <FormField control={control} name={`marketingKits.${index}.featuredImage`} render={({ field }) => ( <FileUploadButton label="Featured Image*" onFileSelect={field.onChange} previewUrl={field.value} hint="marketing poster" /> )} />
                            <FormField control={control} name={`marketingKits.${index}.nameOrTitle`} render={({ field }) => ( <FormItem><FormLabel>Name or Title*</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={control} name={`marketingKits.${index}.uploadedFile`} render={({ field }) => ( <FileUploadButton label="Upload File*" onFileSelect={field.onChange} previewUrl={field.value.startsWith('data:image') ? field.value : undefined} hint="document" accept="image/*,application/pdf" /> )} />
                          </div>
                           {marketingKitFields.length > 1 && ( <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeMarketingKit(index)}><Trash2 className="h-4 w-4" /></Button> )}
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendMarketingKit({ id: `kit${Date.now()}`, kitType: 'poster', featuredImage: '', nameOrTitle: '', uploadedFile: '' })}><Plus className="mr-2 h-4 w-4" /> Add More</Button>
                    </div>
                  )}

                  {step === 9 && (
                    <div className="space-y-4">
                        <FormField control={control} name="writeNotes" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Write a Notes Catalog</FormLabel></FormItem>)} />
                        {watchedValues.writeNotes && <FormField control={control} name="notesContent" render={({ field }) => (<FormItem><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />}
                        
                        <FormField control={control} name="writeTerms" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Write a Terms and Condition</FormLabel></FormItem>)} />
                         {watchedValues.writeTerms && <FormField control={control} name="termsContent" render={({ field }) => (<FormItem><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />}

                        <FormField control={control} name="writePolicy" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Write a Other Legal Policy</FormLabel></FormItem>)} />
                         {watchedValues.writePolicy && <FormField control={control} name="policyContent" render={({ field }) => (<FormItem><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />}
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>Previous</Button>
                {step < steps.length ? (
                  <Button type="button" onClick={nextStep}>Next</Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Catalog'}</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
}
