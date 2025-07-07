
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
import { getCategories } from '@/app/manage-category/actions';
import type { Category } from '@/types';
import { partnerCategories } from '@/types';

// Schemas for each step
const step1Schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  metaKeyword: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  featuredImage: z.string().min(1, 'Featured image is required'),
});

const step2Schema = z.object({
  pricingType: z.enum(['INR', 'USD']),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be a positive number'),
  earningType: z.enum(['Fixed rate', 'commission', 'reward point', 'partner_category_commission']),
  earning: z.coerce.number().optional(),
  partnerCategoryCommissions: z.object({
    'Affiliate Partner': z.coerce.number().optional(),
    'Super Affiliate Partner': z.coerce.number().optional(),
    'Associate Partner': z.coerce.number().optional(),
    'Channel Partner': z.coerce.number().optional(),
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.earningType === 'partner_category_commission') {
    if (!data.partnerCategoryCommissions || Object.values(data.partnerCategoryCommissions).every(v => v === undefined || v === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one partner commission must be set.',
        path: ['partnerCategoryCommissions'],
      });
    }
  } else {
    if (data.earning === undefined || data.earning === null || data.earning < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A positive earning value is required for this earning type.',
        path: ['earning'],
      });
    }
  }
});


const step3Schema = z.object({
  slideshows: z.array(z.object({
    id: z.string(),
    image: z.string().optional(),
    title: z.string().optional(),
  })).optional(),
});

const step4Schema = z.object({
  detailsContent: z.string().optional(),
});

const step5Schema = z.object({
  faqs: z.array(z.object({
    id: z.string(),
    question: z.string().optional(),
    answer: z.string().optional(),
  })).optional(),
});

const step6Schema = z.object({
  galleryImages: z.array(z.object({
    value: z.string().min(1, 'An image is required.')
  })).optional(),
});

const step7Schema = z.object({
  videoLink: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});

const step8Schema = z.object({
  marketingKits: z.array(z.object({
    id: z.string(),
    kitType: z.enum(['poster', 'brochure']),
    featuredImage: z.string().optional(),
    nameOrTitle: z.string().optional(),
    uploadedFile: z.string().optional(),
  })).optional(),
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
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(true);

  React.useEffect(() => {
    async function fetchCategoriesData() {
        setLoadingCategories(true);
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
        setLoadingCategories(false);
    }
    fetchCategoriesData();
  }, []);

  const methods = useForm<FormValues>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      title: '',
      description: '',
      metaKeyword: '',
      categoryId: '',
      featuredImage: '',
      pricingType: 'INR',
      sellingPrice: 0,
      earningType: 'Fixed rate',
      earning: 0,
      slideshows: [],
      detailsContent: '',
      faqs: [],
      galleryImages: [],
      videoLink: '',
      marketingKits: [],
      writeNotes: false,
      notesContent: '',
      writeTerms: false,
      termsContent: '',
      writePolicy: false,
      policyContent: '',
      partnerCategoryCommissions: {},
    },
    mode: 'onChange'
  });

  const { trigger, handleSubmit, formState: { isSubmitting }, control, watch, setValue } = methods;

  const earningType = watch('earningType');

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
    const selectedCategory = categories.find(c => c.id === data.categoryId);
    if (!selectedCategory) {
        toast({ title: 'Error', description: 'Please select a valid category.', variant: 'destructive' });
        return;
    }
    
    const finalData = {
      ...data,
      categoryName: selectedCategory.name,
      galleryImages: (data.galleryImages || []).map(img => img.value),
    };
    
    const result = await addCatalog(finalData);
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
                      <FormField
                        control={control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category*</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingCategories}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                          <FormItem><FormLabel>Earning Type</FormLabel><Select 
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    if (value === 'partner_category_commission') {
                                        setValue('earning', undefined);
                                    } else {
                                        setValue('partnerCategoryCommissions', {});
                                    }
                                }}
                                defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="Fixed rate">Fixed rate</SelectItem>
                                <SelectItem value="commission">Commission</SelectItem>
                                <SelectItem value="reward point">Reward Point</SelectItem>
                                <SelectItem value="partner_category_commission">Partner Category Commission</SelectItem>
                              </SelectContent>
                          </Select><FormMessage /></FormItem>
                        )} />
                        
                        {earningType !== 'partner_category_commission' ? (
                            <FormField control={control} name="earning" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Earning*</FormLabel>
                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} value={field.value ?? ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        ) : (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Partner Category Commissions (%)</CardTitle>
                              <CardDescription>Set the commission percentage for each partner category.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              {partnerCategories.map(category => (
                                <FormField
                                  key={category}
                                  control={control}
                                  name={`partnerCategoryCommissions.${category}`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{category}</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="e.g., 10 for 10%"
                                          {...field}
                                          onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                                          value={field.value ?? ''}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </CardContent>
                          </Card>
                        )}
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
                          <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeSlideshow(index)}><Trash2 className="h-4 w-4" /></Button>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendSlideshow({ id: `slide_${crypto.randomUUID()}`, image: '', title: '' })}><Plus className="mr-2 h-4 w-4" /> Add More</Button>
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
                          <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeFaq(index)}><Trash2 className="h-4 w-4" /></Button>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendFaq({ id: `faq_${crypto.randomUUID()}`, question: '', answer: '' })}><Plus className="mr-2 h-4 w-4" /> Add More</Button>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="space-y-4">
                        <FormLabel>Gallery Images</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {galleryFields.map((field, index) => (
                                <div key={field.id} className="relative group">
                                    <FormField control={control} name={`galleryImages.${index}.value`} render={({ field }) => (
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
                                            appendGallery({ value: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                };
                                fileInput.click();
                            }}>
                                <Plus className="h-6 w-6" />
                            </Button>
                        </div>
                        <FormMessage>{(methods.formState.errors.galleryImages as any)?.message}</FormMessage>
                    </div>
                  )}
                  
                  {step === 7 && (
                     <FormField control={control} name="videoLink" render={({ field }) => ( <FormItem><FormLabel>Video Link</FormLabel><FormControl><Input placeholder="https://youtube.com/watch?v=..." {...field} /></FormControl><FormMessage /></FormItem> )} />
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
                            <FormField control={control} name={`marketingKits.${index}.uploadedFile`} render={({ field }) => ( <FileUploadButton label="Upload File*" onFileSelect={field.onChange} previewUrl={field.value && field.value.startsWith('data:image') ? field.value : undefined} hint="document" accept="image/*,application/pdf" /> )} />
                          </div>
                          <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeMarketingKit(index)}><Trash2 className="h-4 w-4" /></Button>
                        </Card>
                      ))}
                      <Button type="button" variant="outline" onClick={() => appendMarketingKit({ id: `MR${crypto.randomUUID().substring(0, 10).toUpperCase()}`, kitType: 'poster', featuredImage: '', nameOrTitle: '', uploadedFile: '' })}><Plus className="mr-2 h-4 w-4" /> Add More</Button>
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
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Publishing...' : 'Publish Catalog'}</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
}
