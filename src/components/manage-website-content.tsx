'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import EditBusinessProfileDialog from './edit-business-profile-dialog';
import EditSlideshowDialog from './edit-slideshow-dialog';
import EditContactDetailsDialog from './edit-contact-details-dialog';
import EditLegalInfoDialog from './edit-legal-info-dialog';
import EditLinkDetailsDialog from './edit-link-details-dialog';
import EditPartnerFeesDialog from './edit-partner-fees-dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { getWebsiteData } from '@/app/manage-website/actions';
import type { WebsiteData } from '@/types';
import { feeApplicablePartnerCategories } from '@/types';
import { Skeleton } from './ui/skeleton';

// A simple row component to display info
const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className={`flex flex-col items-start sm:flex-row sm:items-center justify-between py-4 border-b last:border-b-0`}>
    <p className="text-sm font-medium w-full sm:w-1/3">{label}</p>
    <div className={`w-full sm:w-2/3 text-sm text-muted-foreground text-left sm:text-right mt-1 sm:mt-0 break-words`}>
        {children}
    </div>
  </div>
);

// A card with an edit button in the header
const EditableCard: React.FC<{ title: string; children: React.ReactNode; editComponent: React.ReactNode; className?: string }> = ({ title, children, editComponent, className }) => (
    <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {editComponent}
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const ContentSkeleton = () => (
    <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-[125px] w-full" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[250px] w-full" />
        <Skeleton className="h-[250px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
    </div>
);


export default function ManageWebsiteContent() {
  const [websiteData, setWebsiteData] = React.useState<WebsiteData | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchAndSetWebsiteData = React.useCallback(async () => {
    const data = await getWebsiteData();
    setWebsiteData(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    setLoading(true);
    fetchAndSetWebsiteData();
  }, [fetchAndSetWebsiteData]);

  if (loading || !websiteData) {
    return <ContentSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
        <Card>
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex flex-col items-start text-left sm:flex-row sm:items-center sm:text-left gap-4">
                    <Avatar className="h-20 w-20 border">
                        <AvatarImage src={websiteData.businessInfo.avatar} alt={websiteData.businessInfo.name} data-ai-hint="logo company" />
                        <AvatarFallback>{websiteData.businessInfo.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold">{websiteData.businessInfo.name}</h2>
                        <p className="text-muted-foreground">{websiteData.businessInfo.tagline}</p>
                    </div>
                </div>
                <EditBusinessProfileDialog businessInfo={websiteData.businessInfo} onUpdate={fetchAndSetWebsiteData}>
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-5 w-5" />
                    </Button>
                </EditBusinessProfileDialog>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Slideshow</CardTitle>
                 <EditSlideshowDialog slideshows={websiteData.slideshows} onUpdate={fetchAndSetWebsiteData}>
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </EditSlideshowDialog>
            </CardHeader>
            <CardContent>
                {websiteData.slideshows.length > 0 ? (
                    <Carousel
                        opts={{
                            align: 'start',
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {websiteData.slideshows.map((slide) => (
                                <CarouselItem key={slide.id}>
                                    <a
                                        href={slide.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <div className="relative h-56 sm:h-80 w-full overflow-hidden rounded-lg">
                                            <Image
                                                src={slide.image}
                                                alt={slide.title}
                                                fill
                                                className="object-cover"
                                                data-ai-hint="presentation slide"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
                                                <h3 className="text-lg sm:text-2xl font-bold">{slide.title}</h3>
                                            </div>
                                        </div>
                                    </a>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
                    </Carousel>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No slideshow images have been added yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>

        <EditableCard
            title="Contact Details"
            editComponent={
                <EditContactDetailsDialog contactDetails={websiteData.contactDetails} onUpdate={fetchAndSetWebsiteData}>
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </EditContactDetailsDialog>
            }
        >
           <div className="divide-y">
                <InfoRow label="Contact Name">{websiteData.contactDetails.name}</InfoRow>
                <InfoRow label="Display Phone Number">{websiteData.contactDetails.phone}</InfoRow>
                <InfoRow label="Display Email Details">{websiteData.contactDetails.email}</InfoRow>
                <InfoRow label="Address">{websiteData.contactDetails.address}</InfoRow>
           </div>
        </EditableCard>

        <EditableCard
            title="Partner Registration Fees"
            editComponent={
                <EditPartnerFeesDialog partnerFees={websiteData.partnerFees} onUpdate={fetchAndSetWebsiteData}>
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </EditPartnerFeesDialog>
            }
        >
            <div className="divide-y">
                {feeApplicablePartnerCategories.map((category) => (
                    <InfoRow key={category} label={category}>
                        {websiteData.partnerFees?.[category] ? `₹${websiteData.partnerFees[category]?.toLocaleString()}` : 'Not Set'}
                    </InfoRow>
                ))}
            </div>
        </EditableCard>

        <EditableCard
            title="Website About &amp; Legal Link"
            editComponent={
                <EditLegalInfoDialog legalInfo={websiteData.legalInfo} onUpdate={fetchAndSetWebsiteData}>
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </EditLegalInfoDialog>
            }
        >
            <div className="divide-y">
                <InfoRow label="About Page">
                    {websiteData.legalInfo.about}
                </InfoRow>
                <InfoRow label="Terms Of Services">
                    <a href={websiteData.legalInfo.terms} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {websiteData.legalInfo.terms}
                    </a>
                </InfoRow>
                <InfoRow label="Privacy policy">
                    <a href={websiteData.legalInfo.privacy} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {websiteData.legalInfo.privacy}
                    </a>
                </InfoRow>
                <InfoRow label="Refund policy">
                    <a href={websiteData.legalInfo.refund} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {websiteData.legalInfo.refund}
                    </a>
                </InfoRow>
                <InfoRow label="Disclaimer">
                    <a href={websiteData.legalInfo.disclaimer} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {websiteData.legalInfo.disclaimer}
                    </a>
                </InfoRow>
            </div>
        </EditableCard>

        <EditableCard
            title="Your Link Details"
            editComponent={
                <EditLinkDetailsDialog links={websiteData.links} onUpdate={fetchAndSetWebsiteData}>
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </EditLinkDetailsDialog>
            }
        >
            <div className="divide-y">
                <InfoRow label="Website">
                    <a href={websiteData.links.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {websiteData.links.website}
                    </a>
                </InfoRow>
                <InfoRow label="Facebook">
                    <a href={websiteData.links.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {websiteData.links.facebook}
                    </a>
                </InfoRow>
                <InfoRow label="Instagram">
                    <a href={websiteData.links.instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {websiteData.links.instagram}
                    </a>
                </InfoRow>
                <InfoRow label="LinkedIn">
                    <a href={websiteData.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {websiteData.links.linkedin}
                    </a>
                </InfoRow>
                <InfoRow label="YouTube">
                    <a href={websiteData.links.youtube} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                        {websiteData.links.youtube}
                    </a>
                </InfoRow>
            </div>
        </EditableCard>
    </div>
  );
}
