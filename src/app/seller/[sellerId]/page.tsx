
'use client';

import * as React from 'react';
import { getWebsiteData, submitSellerEnquiry } from '@/app/manage-website/actions';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Instagram, Linkedin, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WebsiteData } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


const enquirySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

function EnquiryForm({ sellerId }: { sellerId: string }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof enquirySchema>>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { name: '', email: '', phone: '', message: '' },
  });

  const onSubmit = async (values: z.infer<typeof enquirySchema>) => {
    const result = await submitSellerEnquiry({ sellerId, ...values });
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      form.reset();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Send an Enquiry</h2>
        <p className="text-slate-500 mb-6">We'll get back to you as soon as possible.</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone (Optional)</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
            <FormField control={form.control} name="message" render={({ field }) => ( <FormItem><FormLabel>Message</FormLabel><FormControl><Textarea className="min-h-32" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function LandingPageSkeleton() {
    return (
        <div className="bg-slate-50 min-h-screen">
             <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
                     <Skeleton className="h-12 w-48" />
                     <Skeleton className="h-10 w-24" />
                </div>
            </header>
            <main>
                <Skeleton className="h-[60vh] w-full" />
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12 md:space-y-20">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </main>
             <footer className="bg-slate-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Skeleton className="h-16 w-full" />
                </div>
            </footer>
        </div>
    )
}

export default function SellerLandingPage() {
  const params = useParams();
  const sellerId = params.sellerId as string;
  const [websiteData, setWebsiteData] = React.useState<Omit<WebsiteData, 'partnerFees'> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (sellerId) {
      getWebsiteData(sellerId).then(data => {
        if (!data || !data.businessInfo?.name) {
          setWebsiteData(null);
        } else {
          setWebsiteData(data);
        }
        setLoading(false);
      });
    }
  }, [sellerId]);

  if (loading) {
    return <LandingPageSkeleton />;
  }
  
  if (!websiteData) {
    return <div className="flex items-center justify-center min-h-screen"><h1>404 | Seller Not Found</h1></div>;
  }

  const { businessInfo, slideshows, contactDetails, legalInfo, links } = websiteData;

  return (
    <div className="bg-slate-50 min-h-screen font-body text-slate-800 antialiased scroll-smooth">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <Link href={`/seller/${sellerId}`} className="flex items-center gap-4">
            <Image src={businessInfo.avatar || 'https://placehold.co/50x50.png'} alt={`${businessInfo.name} logo`} width={50} height={50} className="rounded-full" data-ai-hint="logo company" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{businessInfo.name}</h1>
              <p className="text-sm text-slate-500">{businessInfo.tagline}</p>
            </div>
          </Link>
           <nav>
              <Button asChild>
                <Link href="#contact-form">Contact Us</Link>
              </Button>
           </nav>
        </div>
      </header>

      <main>
        {/* Slideshow */}
        {slideshows && slideshows.length > 0 && (
          <section className="relative w-full bg-slate-800">
            <Carousel opts={{ loop: true }} className="w-full">
              <CarouselContent>
                {slideshows.map((slide) => (
                  <CarouselItem key={slide.id}>
                    <div className="relative h-[60vh] max-h-[700px] w-full">
                        <Image src={slide.image} alt={slide.title} fill className="object-cover" data-ai-hint="presentation slide" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-white/50" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-white/50" />
            </Carousel>
          </section>
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-12 md:space-y-20">
          {/* About Us */}
          <section id="about">
            <Card className="overflow-hidden shadow-lg">
              <div className="md:grid md:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">About Us</h2>
                  <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: legalInfo.about.replace(/\n/g, '<br />') }} />
                </div>
                <div className="relative h-64 md:h-full min-h-[300px]">
                   <Image src="https://placehold.co/600x400.png" alt="About us image" fill className="object-cover" data-ai-hint="team meeting"/>
                </div>
              </div>
            </Card>
          </section>
          
          <section id="contact-form">
            <EnquiryForm sellerId={sellerId} />
          </section>

          {/* Contact Us */}
          <section id="contact">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">Get In Touch</h2>
              <p className="text-slate-500 mt-2">We'd love to hear from you. Here's how you can reach us.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <MapPin className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg">Address</h3>
                <p className="text-slate-600 mt-1">{contactDetails.address}</p>
              </div>
              <div className="p-6">
                <Mail className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg">Email</h3>
                <a href={`mailto:${contactDetails.email}`} className="text-primary hover:underline mt-1 block break-all">{contactDetails.email}</a>
              </div>
              <div className="p-6">
                <Phone className="h-10 w-10 mx-auto text-primary mb-4" />
                <h3 className="font-semibold text-lg">Phone</h3>
                <a href={`tel:${contactDetails.phone}`} className="text-primary hover:underline mt-1 block">{contactDetails.phone}</a>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="flex justify-center sm:justify-start items-center gap-4">
              <Image src={businessInfo.avatar || 'https://placehold.co/40x40.png'} alt={`${businessInfo.name} logo`} width={40} height={40} className="rounded-full" data-ai-hint="logo company" />
              <p className="text-center text-sm text-slate-400 sm:text-left">{businessInfo.name}</p>
            </div>
            <div className="mt-4 flex justify-center space-x-6 sm:mt-0 sm:justify-start">
              <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white"><span className="sr-only">Facebook</span><Facebook /></a>
              <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white"><span className="sr-only">Instagram</span><Instagram /></a>
              <a href={links.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white"><span className="sr-only">YouTube</span><Youtube /></a>
              <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white"><span className="sr-only">LinkedIn</span><Linkedin /></a>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-4 md:order-2 justify-center flex-wrap">
              <a href={legalInfo.terms} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:underline">Terms</a>
              <a href={legalInfo.privacy} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:underline">Privacy</a>
              <a href={legalInfo.refund} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:underline">Refund Policy</a>
            </div>
            <p className="mt-8 text-center text-sm text-slate-400 md:order-1 md:mt-0">&copy; {new Date().getFullYear()} {businessInfo.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
