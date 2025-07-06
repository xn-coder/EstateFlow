
'use client';

import type { Catalog, CatalogFAQ, CatalogMarketingKit, CatalogSlideshow } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Youtube } from 'lucide-react';

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b last:border-b-0">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="text-sm col-span-2">{value}</dd>
    </div>
);

const SectionCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const SlideshowCarousel = ({ slideshows }: { slideshows: CatalogSlideshow[] }) => (
    <Carousel>
        <CarouselContent>
            {slideshows.map((slide) => (
                <CarouselItem key={slide.id}>
                    <div className="relative h-64 w-full overflow-hidden rounded-lg">
                        <Image src={slide.image} alt={slide.title} fill className="object-cover" data-ai-hint="presentation slide"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-4 left-4 text-white">
                            <h3 className="text-xl font-bold">{slide.title}</h3>
                        </div>
                    </div>
                </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
    </Carousel>
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

const GalleryGrid = ({ images }: { images: string[] }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-lg border">
                <Image src={img} alt={`Gallery image ${index + 1}`} fill className="object-cover" data-ai-hint="product gallery" />
            </div>
        ))}
    </div>
);

const MarketingKitCard = ({ kit }: { kit: CatalogMarketingKit }) => (
    <Card className="overflow-hidden">
        <div className="relative h-32 bg-muted">
            <Image src={kit.featuredImage} alt={kit.nameOrTitle} fill className="object-cover" data-ai-hint="marketing poster" />
        </div>
        <CardContent className="p-4">
            <h4 className="font-semibold">{kit.nameOrTitle}</h4>
            <Badge variant="outline" className="capitalize mt-2">{kit.kitType}</Badge>
        </CardContent>
    </Card>
);

export default function ViewCatalogContent({ catalog }: { catalog: Catalog }) {
    const formatCurrency = (amount: number, currency: 'INR' | 'USD') => {
        return amount.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
            style: 'currency',
            currency: currency,
        });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Card className="overflow-hidden">
                <div className="relative h-48 md:h-64 w-full">
                    <Image src={catalog.featuredImage} alt={catalog.title} fill className="object-cover" data-ai-hint="product image" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <CardHeader className="relative -mt-20 z-10 text-white">
                    <Badge className="w-fit mb-2 bg-primary/80 backdrop-blur-sm">{catalog.categoryName}</Badge>
                    <CardTitle className="text-3xl font-bold">{catalog.title}</CardTitle>
                    <CardDescription className="text-gray-200 pt-2">{catalog.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-center border-t pt-4">
                        <div><p className="text-sm text-muted-foreground">Price</p><p className="font-bold text-lg">{formatCurrency(catalog.sellingPrice, catalog.pricingType)}</p></div>
                        <div><p className="text-sm text-muted-foreground">Earning Type</p><p className="font-bold text-lg">{catalog.earningType}</p></div>
                        <div><p className="text-sm text-muted-foreground">Earning</p><p className="font-bold text-lg">{catalog.earningType === "Fixed rate" ? formatCurrency(catalog.earning, catalog.pricingType) : `${catalog.earning}`}</p></div>
                    </div>
                </CardContent>
            </Card>

            {catalog.slideshows && catalog.slideshows.length > 0 && (
                <SectionCard title="Slideshow"><SlideshowCarousel slideshows={catalog.slideshows} /></SectionCard>
            )}
            
            {catalog.detailsContent && (
                <SectionCard title="Details"><div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: catalog.detailsContent }} /></SectionCard>
            )}
            
            {catalog.faqs && catalog.faqs.length > 0 && (
                 <SectionCard title="Frequently Asked Questions"><FaqAccordion faqs={catalog.faqs} /></SectionCard>
            )}

            {catalog.galleryImages && catalog.galleryImages.length > 0 && (
                 <SectionCard title="Gallery"><GalleryGrid images={catalog.galleryImages} /></SectionCard>
            )}

            {catalog.videoLink && (
                 <SectionCard title="Video">
                    <a href={catalog.videoLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <Youtube /> <span>Watch on YouTube</span>
                    </a>
                </SectionCard>
            )}
            
            {catalog.marketingKits && catalog.marketingKits.length > 0 && (
                 <SectionCard title="Marketing Kits">
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {catalog.marketingKits.map(kit => <MarketingKitCard key={kit.id} kit={kit} />)}
                    </div>
                 </SectionCard>
            )}
            
            {(catalog.notesContent || catalog.termsContent || catalog.policyContent) && (
                <SectionCard title="Legal & Notes">
                    <dl>
                        {catalog.notesContent && <DetailRow label="Notes" value={<p className="whitespace-pre-wrap">{catalog.notesContent}</p>} />}
                        {catalog.termsContent && <DetailRow label="Terms & Conditions" value={<p className="whitespace-pre-wrap">{catalog.termsContent}</p>} />}
                        {catalog.policyContent && <DetailRow label="Other Policy" value={<p className="whitespace-pre-wrap">{catalog.policyContent}</p>} />}
                    </dl>
                </SectionCard>
            )}
        </div>
    );
}
