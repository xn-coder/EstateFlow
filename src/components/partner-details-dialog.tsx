
'use client';

import * as React from 'react';
import { format } from 'date-fns';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { PartnerActivationInfo } from '@/types';

interface PartnerDetailsDialogProps {
  children: React.ReactNode;
  partnerInfo: PartnerActivationInfo;
}

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="grid grid-cols-3 gap-4 py-2">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="text-sm col-span-2">{value || 'N/A'}</dd>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-md font-semibold mt-4 mb-2">{children}</h3>
)

const ImageViewer = ({ label, base64Image, hint }: { label: string; base64Image?: string; hint: string }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
    {base64Image ? (
      <img src={base64Image} alt={label} className="rounded-lg border max-w-full h-auto max-h-64 object-contain" data-ai-hint={hint} />
    ) : (
      <div className="text-sm text-center border-dashed border-2 rounded-lg p-8 bg-muted">No Image Uploaded</div>
    )}
  </div>
);


export default function PartnerDetailsDialog({ children, partnerInfo }: PartnerDetailsDialogProps) {
  const { user, profile } = partnerInfo;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Partner Registration Details</DialogTitle>
          <DialogDescription>Review the complete details for {user.name}.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="px-6 pb-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg">
                <Avatar className="h-20 w-20 border">
                    <AvatarImage src={profile.profileImage} alt={profile.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{profile.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                    <h2 className="text-xl font-bold">{profile.name}</h2>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <p className="text-sm text-muted-foreground">{profile.phone}</p>
                </div>
              </div>
              
              <dl className="divide-y">
                <SectionTitle>Personal Details</SectionTitle>
                <DetailRow label="Date of Birth" value={format(new Date(profile.dob), 'PPP')} />
                <DetailRow label="Gender" value={profile.gender} />
                <DetailRow label="Qualification" value={profile.qualification} />
                <DetailRow label="Whatsapp No." value={profile.whatsapp} />
                <DetailRow label="Address" value={`${profile.address}, ${profile.city}, ${profile.state} - ${profile.pincode}`} />
              
                <SectionTitle>Business Details</SectionTitle>
                <DetailRow label="Business Type" value={profile.businessType} />
                <DetailRow label="GSTN" value={profile.gstn} />
                <DetailRow label="Business Age" value={`${profile.businessAge} years`} />
                <DetailRow label="Area Covered" value={profile.areaCovered} />
              </dl>
              
              <Separator />

              <SectionTitle>Uploaded Documents</SectionTitle>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ImageViewer label="Business Logo" base64Image={profile.businessLogo} hint="company logo" />
                  <ImageViewer label="Aadhaar Card" base64Image={profile.aadhaarCard} hint="identification card" />
                  <ImageViewer label="PAN Card" base64Image={profile.panCard} hint="identification card" />
               </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-4 border-t bg-background">
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
