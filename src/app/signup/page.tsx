
'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, Upload, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subYears } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { registerPartner } from './actions';
import { qualifications } from '@/types';

// Zod schemas for each step
const personalDetailsSchema = z.object({
  profileImage: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  dob: z.date({ required_error: 'Date of birth is required' }),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
  qualification: z.enum(qualifications, { required_error: 'Qualification is required' }),
  phone: z.string().min(10, 'A valid phone number is required'),
  email: z.string().email('Invalid email address'),
  whatsapp: z.string().min(10, 'A valid WhatsApp number is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(6, 'A valid pin code is required'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
});

const businessDetailsSchema = z.object({
  businessLogo: z.string().optional(),
  businessType: z.string().min(1, 'Business type is required'),
  partnerCategory: z.enum(['Affiliate Partner', 'Super Affiliate Partner', 'Associate Partner', 'Channel Partner'], { required_error: 'Partner category is required' }),
  gstn: z.string().optional(),
  businessAge: z.coerce.number().min(0, 'Business age cannot be negative'),
  areaCovered: z.string().min(1, 'Area covered is required'),
});

const documentUploadsSchema = z.object({
  aadhaarCard: z.string().min(1, 'Aadhaar card is required'),
  panCard: z.string().min(1, 'PAN card is required'),
  paymentProof: z.string().optional(),
});

// We only need the shape for triggering validation
const combinedSchemaForValidation = personalDetailsSchema
  .merge(businessDetailsSchema)
  .merge(documentUploadsSchema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    if (data.partnerCategory === 'Affiliate Partner' && !data.paymentProof) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Payment proof is required for this partner type.',
            path: ['paymentProof'],
        });
    }
  });


// Final schema for submission includes password
const finalSchema = combinedSchemaForValidation;

type FormValues = z.infer<typeof finalSchema>;

const steps = [
  { id: 1, title: 'Personal Details', fields: Object.keys(personalDetailsSchema.shape) as (keyof z.infer<typeof personalDetailsSchema>)[] },
  { id: 2, title: 'Business Details', fields: Object.keys(businessDetailsSchema.shape) as (keyof z.infer<typeof businessDetailsSchema>)[] },
  { id: 3, title: 'Document Uploads', fields: [...Object.keys(documentUploadsSchema.shape), 'paymentProof'] as (keyof z.infer<typeof documentUploadsSchema>)[] },
];

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className={cn("h-2 w-12 rounded-full transition-colors",
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                )}></div>
            ))}
        </div>
    )
}

function FileUploadButton({ label, onFileSelect, previewUrl, hint }: { label: string; onFileSelect: (base64: string) => void; previewUrl?: string | null; hint: string }) {
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
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20 border">
        <AvatarImage src={previewUrl || ''} data-ai-hint={hint} />
        <AvatarFallback><Upload /></AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <FormLabel>{label}</FormLabel>
        <Button type="button" variant="outline" className="w-full mt-2" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
        <Input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
      </div>
    </div>
  );
}

const eighteenYearsAgo = subYears(new Date(), 18);
const oneHundredYearsAgo = subYears(new Date(), 100);

export default function SignupPage() {
  const [step, setStep] = React.useState(1);
  const router = useRouter();
  const { toast } = useToast();

  const methods = useForm<FormValues>({
    resolver: zodResolver(combinedSchemaForValidation),
    defaultValues: {
      name: '',
      gender: undefined,
      qualification: undefined,
      phone: '',
      email: '',
      whatsapp: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      password: '',
      confirmPassword: '',
      businessType: '',
      gstn: '',
      businessAge: 0,
      areaCovered: '',
      aadhaarCard: '',
      panCard: '',
      partnerCategory: undefined,
    },
    mode: 'onChange'
  });

  const { trigger, handleSubmit, formState: { isSubmitting }, watch } = methods;
  const partnerCategory = watch('partnerCategory');

  const nextStep = async () => {
    const currentStepFields = steps[step - 1].fields;
    const isValid = await trigger(currentStepFields as any);
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
    const result = await registerPartner(data);
    if(result.success) {
        toast({ title: 'Registration Successful', description: result.message });
        router.push('/login');
    } else {
        toast({ title: 'Registration Failed', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Building2 className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold text-primary font-headline">
                EstateFlow
                </h1>
            </div>
            <CardTitle className="text-2xl">Partner Registration</CardTitle>
            <CardDescription>{steps[step-1].title}</CardDescription>
        </CardHeader>
        <CardContent>
            <StepIndicator currentStep={step} totalSteps={steps.length} />
            <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {step === 1 && (
                <div className="space-y-4">
                  <FormField control={methods.control} name="profileImage" render={({ field }) => (
                      <FormItem>
                          <FileUploadButton label="Profile Image" onFileSelect={field.onChange} previewUrl={field.value} hint="person portrait" />
                          <FormMessage />
                      </FormItem>
                  )} />
                  <FormField control={methods.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Personal Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={methods.control} name="dob" render={({ field }) => (
                      <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><Popover>
                        <PopoverTrigger asChild><FormControl><Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button></FormControl></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                           <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            captionLayout="dropdown-buttons"
                            fromYear={oneHundredYearsAgo.getFullYear()}
                            toYear={eighteenYearsAgo.getFullYear()}
                            disabled={(date) => date > eighteenYearsAgo || date < oneHundredYearsAgo}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover><FormMessage /></FormItem>
                    )} />
                    <FormField control={methods.control} name="gender" render={({ field }) => (
                      <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                      </Select><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={methods.control} name="qualification" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger></FormControl>
                          <SelectContent>
                              {qualifications.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={methods.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={methods.control} name="whatsapp" render={({ field }) => ( <FormItem><FormLabel>Whatsapp Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                  <FormField control={methods.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={methods.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={methods.control} name="confirmPassword" render={({ field }) => ( <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                  <FormField control={methods.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={methods.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={methods.control} name="state" render={({ field }) => ( <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={methods.control} name="pincode" render={({ field }) => ( <FormItem><FormLabel>Pin Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                </div>
              )}

              {step === 2 && (
                 <div className="space-y-4">
                    <FormField control={methods.control} name="businessLogo" render={({ field }) => (
                      <FormItem>
                          <FileUploadButton label="Business Logo" onFileSelect={field.onChange} previewUrl={field.value} hint="company logo" />
                          <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={methods.control} name="businessType" render={({ field }) => ( <FormItem><FormLabel>Business Type</FormLabel><FormControl><Input placeholder="e.g., Real Estate Agency" {...field} /></FormControl><FormMessage /></FormItem> )} />
                     <FormField control={methods.control} name="partnerCategory" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Partner Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Affiliate Partner">Affiliate Partner</SelectItem>
                                    <SelectItem value="Super Affiliate Partner">Super Affiliate Partner</SelectItem>
                                    <SelectItem value="Associate Partner">Associate Partner</SelectItem>
                                    <SelectItem value="Channel Partner">Channel Partner</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={methods.control} name="gstn" render={({ field }) => ( <FormItem><FormLabel>GSTN (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={methods.control} name="businessAge" render={({ field }) => ( <FormItem><FormLabel>Age of Business (in years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={methods.control} name="areaCovered" render={({ field }) => ( <FormItem><FormLabel>Area Covered</FormLabel><FormControl><Input placeholder="e.g., Downtown, North Suburbs" {...field} /></FormControl><FormMessage /></FormItem> )} />
                 </div>
              )}

              {step === 3 && (
                 <div className="space-y-6">
                    <FormField control={methods.control} name="aadhaarCard" render={({ field }) => (
                      <FormItem>
                          <FileUploadButton label="Aadhaar Card" onFileSelect={field.onChange} previewUrl={field.value} hint="identification card" />
                          <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={methods.control} name="panCard" render={({ field }) => (
                      <FormItem>
                          <FileUploadButton label="PAN Card" onFileSelect={field.onChange} previewUrl={field.value} hint="identification card" />
                          <FormMessage />
                      </FormItem>
                    )} />
                    {partnerCategory === 'Affiliate Partner' && (
                        <FormField control={methods.control} name="paymentProof" render={({ field }) => (
                            <FormItem>
                                <FileUploadButton label="Upload Fee Payment Proof" onFileSelect={field.onChange} previewUrl={field.value} hint="payment receipt" />
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
                 </div>
              )}

              <div className="flex justify-between pt-4">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep}>Previous</Button>
                ) : <div></div>}
                {step < steps.length ? (
                  <Button type="button" onClick={nextStep}>Next</Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Registration'}</Button>
                )}
              </div>
            </form>
            </FormProvider>
            <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                    Log in
                </Link>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
