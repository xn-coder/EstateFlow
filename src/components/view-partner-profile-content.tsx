'use client';

import type { PartnerActivationInfo, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Settings, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import SendDirectMessageDialog from './send-direct-message-dialog';
import SendRewardPointsDialog from './send-reward-points-dialog';
import { DialogTrigger } from './ui/dialog';

const StatCard = ({ title, value, description }: { title: string; value: string; description: string }) => (
  <Card>
    <CardHeader className="pb-4">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <div className="flex justify-between py-3 border-b border-gray-200 text-sm last:border-b-0">
      <p className="font-medium text-gray-500">{label}</p>
      <p className="text-gray-900 text-right">{value}</p>
    </div>
  );

const ActionButton = ({ children, icon, asChild, ...props }: { children: React.ReactNode; icon: React.ReactNode; asChild?: boolean;[x: string]: any; }) => (
    <Button variant="outline" className="w-full justify-between h-12 text-base font-normal" asChild={asChild} {...props}>
      <span>{children}</span>
      {icon}
    </Button>
);

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);


const ListItem = ({ children, href = "#" }: { children: React.ReactNode; href?: string; }) => (
    <Link href={href} className="block w-full text-left">
        <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
            <span className="font-medium text-sm">{children}</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
    </Link>
);

const ListItemButton = ({ children }: { children: React.ReactNode; }) => (
    <div className="w-full text-left">
        <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
            <span className="font-medium text-sm">{children}</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
    </div>
);


export default function ViewPartnerProfileContent({ partnerInfo, currentUser }: { partnerInfo: PartnerActivationInfo, currentUser: User }) {
  const { user, profile } = partnerInfo;
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Manager';
  const isSeller = currentUser.role === 'Seller';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
        <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border">
                        <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-sm text-muted-foreground">{user.partnerCode || 'DSA 000 000 001'}</p>
                    </div>
                </div>
                <SendDirectMessageDialog partner={user}>
                    <Button variant="ghost" size="icon">
                        <Mail className="h-5 w-5" />
                    </Button>
                </SendDirectMessageDialog>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Sales" value="1000" description="Order" />
            <StatCard title="Customer" value="1000" description="User" />
            <StatCard title="Revenue" value="100" description="Earning" />
            <StatCard title="Support" value="10" description="Ticket" />
        </div>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base font-semibold">Contact Details</CardTitle>
                {isAdmin && (
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                )}
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SendDirectMessageDialog partner={user}>
                <ActionButton icon={<Mail />}>Send Message</ActionButton>
            </SendDirectMessageDialog>
            <ActionButton icon={<WhatsAppIcon />}>WhatsApp</ActionButton>
            <ActionButton icon={<Phone />}>Call Now</ActionButton>
        </div>
        
        <Card>
            <CardContent className="p-0">
                  <div className="divide-y">
                    <ListItem href={`/manage-orders?partnerId=${user.id}`}>View Enquiry</ListItem>
                    <ListItem href={`/manage-customers?partnerId=${user.id}`}>Manage Customer</ListItem>
                    {isSeller && (
                      <SendRewardPointsDialog currentUser={currentUser} onSuccess={() => {}} partner={user}>
                          <DialogTrigger asChild>
                              <ListItemButton>Send Reward Point</ListItemButton>
                          </DialogTrigger>
                      </SendRewardPointsDialog>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
