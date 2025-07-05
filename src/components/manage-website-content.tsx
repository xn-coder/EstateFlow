
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { websiteData } from '@/lib/website-data';
import EditBusinessProfileDialog from './edit-business-profile-dialog';
import EditSlideshowDialog from './edit-slideshow-dialog';

// A simple row component to display info
const InfoRow: React.FC<{ label: string; children: React.ReactNode, isLongText?: boolean }> = ({ label, children, isLongText }) => (
  <div className={`flex ${isLongText ? 'flex-col' : 'flex-row items-center'} justify-between py-4 border-b last:border-b-0`}>
    <p className="text-sm font-medium w-1/3">{label}</p>
    <div className={`w-2/3 text-sm text-muted-foreground ${isLongText ? 'w-full mt-2' : 'text-right'}`}>
        {children}
    </div>
  </div>
);

// A card with an edit button in the header
const EditableCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
            </Button>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

export default function ManageWebsiteContent() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border">
                        <AvatarImage src={websiteData.businessInfo.avatar} alt={websiteData.businessInfo.name} data-ai-hint="logo company" />
                        <AvatarFallback>{websiteData.businessInfo.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold">{websiteData.businessInfo.name}</h2>
                        <p className="text-muted-foreground">{websiteData.businessInfo.tagline}</p>
                    </div>
                </div>
                <EditBusinessProfileDialog>
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-5 w-5" />
                    </Button>
                </EditBusinessProfileDialog>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Slideshow</CardTitle>
                 <EditSlideshowDialog>
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </EditSlideshowDialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {websiteData.slideshows.map((slide) => (
                        <div key={slide.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div className="flex items-center gap-4">
                                <Image src={slide.image} alt={slide.title} width={120} height={50} className="rounded-md object-cover" data-ai-hint="presentation slide" />
                                <div>
                                    <p className="font-medium">{slide.title}</p>
                                    <a href={slide.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{slide.link}</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <EditableCard title="Contact Details">
           <div className="divide-y">
                <InfoRow label="Contact Name">{websiteData.contactDetails.name}</InfoRow>
                <InfoRow label="Display Phone Number">{websiteData.contactDetails.phone}</InfoRow>
                <InfoRow label="Display Email Details">{websiteData.contactDetails.email}</InfoRow>
                <InfoRow label="Address">{websiteData.contactDetails.address}</InfoRow>
           </div>
        </EditableCard>

        <EditableCard title="Website About & Legal Link">
            <div className="divide-y">
                <InfoRow label="About Page" isLongText>
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

        <EditableCard title="Your Link Details">
            <div className="divide-y">
                <InfoRow label="Website">
                    <a href={`//${websiteData.links.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
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
