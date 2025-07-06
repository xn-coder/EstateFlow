
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import type { PartnerActivationInfo, User } from '@/types';
import { getPartnerById } from '@/app/manage-partner/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const EditableSectionCard = ({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void; }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between py-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Settings className="h-5 w-5 text-muted-foreground" />
      </Button>
    </CardHeader>
    <CardContent className="pt-0">
      {children}
    </CardContent>
  </Card>
);

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="flex justify-between py-3.5 border-t text-sm first:border-t-0">
    <p className="text-muted-foreground">{label}</p>
    <p className="font-medium text-right">{value || 'N/A'}</p>
  </div>
);

function ProfilePageSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}


export default function PartnerProfileContent({ currentUser }: { currentUser: User }) {
  const [partnerInfo, setPartnerInfo] = React.useState<PartnerActivationInfo | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    if (currentUser) {
      getPartnerById(currentUser.id).then(data => {
        if (data) {
          setPartnerInfo(data);
        }
        setLoading(false);
      });
    }
  }, [currentUser]);

  const handleEdit = (section: string) => {
    toast({ title: 'Info', description: `Edit functionality for ${section} is not implemented yet.` });
  };
  
  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (!partnerInfo) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <h3 className="text-lg font-medium">Partner Profile Not Found</h3>
          <p className="text-muted-foreground">We couldn't load the partner's detailed profile. Please contact support.</p>
        </CardContent>
      </Card>
    );
  }

  const { user, profile } = partnerInfo;
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.partnerCode || 'DSA010001'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Points</p>
            <p className="text-xl font-bold">0000001</p>
          </div>
        </CardContent>
      </Card>

      <EditableSectionCard title="Personal Details" onEdit={() => handleEdit('Personal Details')}>
        <DetailRow label="Full Name" value={profile.name} />
        <DetailRow label="Date Of Birth" value={format(new Date(profile.dob), 'd MMMM yyyy')} />
        <DetailRow label="Gender" value={profile.gender} />
        <DetailRow label="Education" value={profile.qualification} />
      </EditableSectionCard>

      <EditableSectionCard title="Contact Details" onEdit={() => handleEdit('Contact Details')}>
        <DetailRow label="Phone Number" value={profile.phone} />
        <DetailRow label="WhatsApp Number" value={profile.whatsapp} />
        <DetailRow label="Business Email" value={profile.email} />
      </EditableSectionCard>
      
      <EditableSectionCard title="Address Details" onEdit={() => handleEdit('Address Details')}>
        <DetailRow label="Address" value={profile.address} />
        <DetailRow label="City Pincode" value={profile.pincode} />
        <DetailRow label="City" value={profile.city} />
        <DetailRow label="State" value={profile.state} />
        <DetailRow label="Country" value="India" />
      </EditableSectionCard>

      <EditableSectionCard title="Security Update" onEdit={() => handleEdit('Security Update')}>
        <DetailRow label="Password" value="************" />
        <DetailRow label="Addon Key" value="Active" />
      </EditableSectionCard>
      
       <EditableSectionCard title="KYC Update" onEdit={() => handleEdit('KYC Update')}>
        <DetailRow label="Aadhar Number" value="4000 5000 1000" />
        <DetailRow label="PAN Number" value="PANN032783" />
        <DetailRow label="Status" value={user.status === 'Active' ? 'Verified' : user.status} />
      </EditableSectionCard>
    </div>
  );
}
