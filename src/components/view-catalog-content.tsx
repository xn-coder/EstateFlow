
'use client';

import type { Catalog, CatalogFAQ, CatalogMarketingKit, CatalogSlideshow, User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ChevronRight, Download, Phone, Video, Youtube } from 'lucide-react';
import Link from 'next/link';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { submitEnquiry } from '@/app/manage-orders/actions';
import { useToast } from '@/hooks/use-toast';


const SectionCard = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <Card className={className}>
        <CardHeader><CardTitle className="text-base font-semibold text-gray-700 dark:text-gray-300">{title}</CardTitle></CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const SlideshowCarousel = ({ slideshows }: { slideshows: CatalogSlideshow[] }) => (
    <Carousel className="w-full">
        <CarouselContent>
            {slideshows.map((slide) => (
                <CarouselItem key={slide.id}>
                    <div className="relative h-96 w-full overflow-hidden rounded-lg">
                        <Image src={slide.image} alt={slide.title} fill className="object-cover" data-ai-hint="presentation slide"/>
                    </div>
                </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
    </Carousel>
);

const GalleryGrid = ({ images }: { images: string[] }) => (
    <div className="grid grid-cols-3 gap-4">
        {images.map((img, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-lg border">
                <Image src={img} alt={`Gallery image ${index + 1}`} fill className="object-cover" data-ai-hint="product gallery" />
            </div>
        ))}
    </div>
);

const FaqAccordion = ({ faqs }: { faqs: CatalogFAQ[] }) => (
    <Accordion type="single" collapsible className="w-full">
        {faqs.map(faq => (
            <AccordionItem value={faq.id} key={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
        ))}
    </Accordion>
);

const enquirySchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerPhone: z.string().min(10, 'A valid phone number is required'),
  customerEmail: z.string().email('A valid email is required'),
  customerPincode: z.string().min(1, 'Pincode or City is required'),
});

const EnquiryForm = ({ catalog, currentUser }: { catalog: Catalog, currentUser: User }) => {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof enquirySchema>>({
        resolver: zodResolver(enquirySchema),
        defaultValues: {
            customerName: '',
            customerPhone: '',
            customerEmail: '',
            customerPincode: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof enquirySchema>) => {
        const result = await submitEnquiry({
            ...values,
            catalogId: catalog.id,
            catalogCode: catalog.catalogCode,
            catalogTitle: catalog.title,
            submittedBy: {
                id: currentUser.id,
                name: currentUser.name,
                role: currentUser.role,
            }
        });

        if (result.success) {
            toast({ title: 'Success', description: result.message });
            form.reset();
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-semibold">Enquiry Now</CardTitle>
            </CardHeader>
            <CardContent>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormItem>
                            <FormLabel>Partner ID</FormLabel>
                            <FormControl>
                                <Input value={currentUser.partnerCode || 'N/A'} readOnly disabled />
                            </FormControl>
                        </FormItem>
                        <FormField control={form.control} name="customerName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer Name</FormLabel>
                                <FormControl><Input placeholder="Customer Name" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="customerPhone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl><Input placeholder="Phone Number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="customerEmail" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer Email</FormLabel>
                                <FormControl><Input type="email" placeholder="Customer Email" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="customerPincode" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Pin Code or City</FormLabel>
                                <FormControl><Input placeholder="Pin Code OR City Name" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Submitting...' : 'Submit & Processed'}
                        </Button>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
};

const SupportCard = () => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base font-semibold">Seller Profile & Support Team</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="Support Team" data-ai-hint="person"/>
                        <AvatarFallback>ST</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">Name Here</p>
                        <p className="text-sm text-muted-foreground">Support Team</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="text-green-500 border-green-500 hover:bg-green-50">
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-red-500 border-red-500 hover:bg-red-50">
                        <Video className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
);

const FindCatalogForm = () => (
    <Card>
        <CardHeader>
            <CardTitle className="text-base font-semibold">Find Other Catalog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Input placeholder="Catalog Name OR Code" />
            <Select><SelectTrigger><SelectValue placeholder="Select Related Query" /></SelectTrigger><SelectContent><SelectItem value="query1">Query 1</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Select Option" /></SelectTrigger><SelectContent><SelectItem value="option1">Option 1</SelectItem></SelectContent></Select>
            <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white">Find Now</Button>
        </CardContent>
    </Card>
);

const QuickLinks = () => {
    const links = ["Invoice & Billing", "Customer Management", "Wallets, TopUp & Payment", "Payout, Withdrow Request", "Platform Uses Details", "Other Query"];
    return(
        <Card>
            <CardContent className="p-0">
                <div className="divide-y">
                    {links.map(link => (
                        <Link href="#" key={link} className="flex justify-between items-center p-3 text-sm font-medium hover:bg-muted/50">
                            <span>{link}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground"/>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
};


export default function ViewCatalogContent({ catalog, currentUser }: { catalog: Catalog, currentUser: User }) {
    const formatCurrency = (amount: number, currency: 'INR' | 'USD') => {
        return amount.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
        });
    };
    
    const getEarningText = () => {
        if (catalog.earningType === 'Fixed rate') {
            return `${formatCurrency(catalog.earning, catalog.pricingType)} Flat`;
        }
        if (catalog.earningType === 'commission') {
            return `${catalog.earning}%`;
        }
        return `${catalog.earning} Points`;
    }

    const marketingVideo = catalog.videoLink;
    const marketingPoster = catalog.marketingKits?.find(k => k.kitType === 'poster');
    const marketingBrochure = catalog.marketingKits?.find(k => k.kitType === 'brochure');

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
                {catalog.slideshows && catalog.slideshows.length > 0 && <SlideshowCarousel slideshows={catalog.slideshows} />}
                
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center text-sm text-muted-foreground">
                        <p>Type: Product</p>
                        <p>Cat: {catalog.categoryName}</p>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">{catalog.title}</h2>
                        <div className="text-right">
                           <p className="font-semibold">{formatCurrency(catalog.sellingPrice, catalog.pricingType)}</p>
                           <p className="text-sm text-muted-foreground">Earning Rate: {getEarningText()}</p>
                        </div>
                    </CardContent>
                </Card>

                {catalog.detailsContent && <SectionCard title="Overview"><p className="text-sm leading-relaxed text-muted-foreground">{catalog.detailsContent}</p></SectionCard>}
                {catalog.galleryImages && catalog.galleryImages.length > 0 && <SectionCard title="Gallery"><GalleryGrid images={catalog.galleryImages} /></SectionCard>}
                {catalog.faqs && catalog.faqs.length > 0 && <SectionCard title="FAQs"><FaqAccordion faqs={catalog.faqs} /></SectionCard>}
                
                {(marketingVideo || marketingPoster || marketingBrochure) && (
                    <SectionCard title="Study & Marketing Materials">
                        <div className="flex flex-wrap gap-4">
                             {marketingVideo && <Button asChild variant="outline"><a href={marketingVideo} target="_blank" rel="noopener noreferrer"><Youtube className="mr-2"/>Watch Video</a></Button>}
                             {marketingPoster && <Button asChild variant="outline"><a href={marketingPoster.uploadedFile} download><Download className="mr-2"/>Download Poster</a></Button>}
                             {marketingBrochure && <Button asChild variant="outline"><a href={marketingBrochure.uploadedFile} download><Download className="mr-2"/>Download Brochure</a></Button>}
                        </div>
                    </SectionCard>
                )}

                <div className="flex justify-between items-center">
                    <Button variant="outline">&lt; Previous</Button>
                    <Button variant="outline">Next &gt;</Button>
                </div>
            </div>

            <aside className="lg:col-span-4 space-y-6">
                <EnquiryForm catalog={catalog} currentUser={currentUser} />
                <SupportCard />
                <FindCatalogForm />
                <QuickLinks />
            </aside>
        </div>
    );
}
