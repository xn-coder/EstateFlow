
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { PartnerActivationInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface PartnerDetailsDialogProps {
  children: React.ReactNode;
  partnerInfo: PartnerActivationInfo;
  onActivate?: (userId: string) => void;
  onApprovePayment?: (userId: string) => void;
}

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-3 border-b last:border-b-0">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="text-sm sm:col-span-2 sm:text-right">{value || 'N/A'}</dd>
  </div>
);

const ImageViewer = ({ label, base64Image, hint }: { label: string; base64Image?: string; hint: string }) => (
  <Card>
      <CardHeader>
          <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center p-4">
        {base64Image ? (
          <img src={base64Image} alt={label} className="rounded-lg border max-w-full h-auto max-h-48 object-contain" data-ai-hint={hint} />
        ) : (
          <div className="text-sm text-center border-dashed border-2 rounded-lg p-8 bg-muted w-full h-48 flex items-center justify-center">No Image Uploaded</div>
        )}
      </CardContent>
  </Card>
);

export default function PartnerDetailsDialog({ children, partnerInfo, onActivate, onApprovePayment }: PartnerDetailsDialogProps) {
  const { user, profile } = partnerInfo;
  
  const handleActivateClick = () => {
    if (onActivate) {
      onActivate(user.id);
    }
  };
  
  const handleApproveClick = () => {
    if (onApprovePayment) {
        onApprovePayment(user.id);
    }
  };


  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Partner Registration Details</DialogTitle>
          <DialogDescription>Review the complete details for {user.name}.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-6">
              <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border">
                            <AvatarImage src={profile.profileImage || user.avatar} alt={profile.name} data-ai-hint="person" />
                            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold">{profile.name}</h2>
                            <p className="text-sm text-muted-foreground">Status: <Badge variant={user.feeStatus === 'Paid' || user.feeStatus === 'Not Applicable' ? 'secondary' : 'destructive'}>{user.feeStatus || 'N/A'}</Badge></p>
                        </div>
                    </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Contact Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <DetailRow label="Contact Name" value={profile.name} />
                    <DetailRow label="Phone Number" value={profile.phone} />
                    <DetailRow label="Email Details" value={profile.email} />
                    <DetailRow label="WhatsApp No." value={profile.whatsapp} />
                    <DetailRow label="Address" value={profile.address} />
                    <DetailRow label="City & State" value={`${profile.city}, ${profile.state}`} />
                    <DetailRow label="Pin Code" value={profile.pincode} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                  <CardTitle>Other Personal Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl>
                    <DetailRow label="Date Of Birth" value={format(new Date(profile.dob), 'dd MMM yyyy')} />
                    <DetailRow label="Gender" value={profile.gender} />
                    <DetailRow label="Education Qualification" value={profile.qualification} />
                  </dl>
                </CardContent>
              </Card>

              <Card>
                 <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl>
                    {profile.businessLogo && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-3 border-b">
                        <dt className="text-sm font-medium text-muted-foreground">Business Logo</dt>
                        <dd className="text-sm col-span-2 flex justify-start sm:justify-end">
                            <img src={profile.businessLogo} alt="Business Logo" className="rounded-lg border max-w-full h-auto max-h-16" data-ai-hint="company logo" />
                        </dd>
                      </div>
                    )}
                    <DetailRow label="Partner Category" value={profile.partnerCategory} />
                    <DetailRow label="Business Type" value={profile.businessType} />
                    <DetailRow label="GSTN" value={profile.gstn ?? 'N/A'} />
                    <DetailRow label="Age of Business" value={`${profile.businessAge} years`} />
                    <DetailRow label="Area Covered" value={profile.areaCovered} />
                  </dl>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageViewer label="Aadhaar Card" base64Image={profile.aadhaarCard} hint="identification card" />
                    <ImageViewer label="PAN Card" base64Image={profile.panCard} hint="identification card" />
                     {profile.paymentProof && (
                        <ImageViewer label="Payment Proof" base64Image={profile.paymentProof} hint="payment receipt" />
                    )}
                </div>
              </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="p-6 pt-4 border-t bg-background justify-between">
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                    {onActivate ? 'Cancel' : 'Close'}
                </Button>
            </DialogClose>
            {onActivate && (
                <div className="flex gap-2">
                    {user.feeStatus === 'Pending Payment' && onApprovePayment && (
                        <Button onClick={handleApproveClick}>Approve Payment</Button>
                    )}
                    <DialogClose asChild>
                        <Button onClick={handleActivateClick} disabled={user.feeStatus === 'Pending Payment'}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate Partner
                        </Button>
                    </DialogClose>
                </div>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
