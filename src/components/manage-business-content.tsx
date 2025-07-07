
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { Category, PartnerActivationInfo, WebsiteData, User } from '@/types';
import { Skeleton } from './ui/skeleton';
import { ChevronRight, Book, Mail, Edit } from 'lucide-react';
import AddMarketingKitDialog from './add-marketing-kit-dialog';
import AddCategoryDialog from './add-category-dialog';
import AddContentDialog from './add-content-dialog';
import AddUserDialog from './add-user-dialog';
import { getCategories } from '@/app/manage-category/actions';
import { getPartnerById } from '@/app/manage-partner/actions';
import { getWebsiteData } from '@/app/manage-website/actions';
import Image from 'next/image';
import EditBusinessDetailsDialog from './edit-partner-business-details-dialog';
import EditPartnerBusinessLogoDialog from './edit-partner-business-logo-dialog';
import EditPartnerDigitalCardDialog from './edit-partner-digital-card-dialog';
import EditLinkDetailsDialog from './edit-link-details-dialog';
import EditBusinessProfileDialog from './edit-business-profile-dialog';

// Components for Admin View
const AdminListItem = ({ children, href = "#", isDialog = false, DialogComponent }: { children: React.ReactNode; href?: string; isDialog?: boolean; DialogComponent?: React.ReactElement; }) => {
    const content = (
        <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors w-full text-left">
            <span className="font-medium">{children}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
    );

    if (isDialog && DialogComponent) {
        return React.cloneElement(DialogComponent, {}, <button className="w-full">{content}</button>);
    }
    
    return (
        <Link href={href} className="flex">
            {content}
        </Link>
    );
};
const AdminActionButton = ({ children, icon, onClick }: { children: React.ReactNode; icon: React.ReactNode; onClick?: () => void; }) => (
    <Button variant="outline" className="w-full justify-between h-14 text-base" onClick={onClick}>
      {children}
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


const AdminBusinessView = () => {
    const router = useRouter();
    const [categories, setCategories] = React.useState<Category[]>([]);

    const fetchCategories = React.useCallback(async () => {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
    }, []);

    React.useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const AdminStatCard = ({ title, value, description }: { title: string; value: string; description: string; }) => (
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle>
          <p className="text-3xl font-bold">{value}</p>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    );

    const partnerItems = [
        { label: 'Manage Partner', href: '/manage-partner' },
        { label: 'Partner Activation', href: '/partner-activation' },
        { label: 'Deactivated Partner', href: '/deactivated-partner' },
        { label: 'Manage Customer', href: '#' },
        { label: 'Manage Access', href: '/manage-access' },
        { label: 'Give Access', isDialog: true, Dialog: <AddUserDialog onUserAdded={() => {}} /> },
    ];

    const catalogItems = [
        { label: 'Add a Catalog', href: '/add-catalog' },
        { label: 'Manage Catalog', href: '/manage-catalog' },
        { label: 'Add a Category', isDialog: true, Dialog: <AddCategoryDialog onCategoryAdded={fetchCategories} /> },
        { label: 'Manage Categories', href: '/manage-category' },
        { label: 'Add Content', isDialog: true, Dialog: <AddContentDialog categories={categories} onContentAdded={() => {}} /> },
        { label: 'Manage Content', href: '/manage-content' },
        { label: 'Add a Marketing Kit', isDialog: true, Dialog: <AddMarketingKitDialog onKitAdded={() => {}} /> },
        { label: 'Manage Marketing Kits', href: '/manage-marketing-kits' },
    ];
    
    const accountItems = [
        { label: 'Leaderboard', href: '#' },
        { label: 'Manage Website', href: '/manage-website' },
        { label: 'My Account', href: '/profile' },
    ];


    return (
        <div className="space-y-6 max-w-7xl mx-auto">
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <AdminStatCard title="Sales" value="1000" description="Order" />
                <AdminStatCard title="Partner" value="1000" description="Members" />
                <AdminStatCard title="Customer" value="100" description="User" />
                <AdminStatCard title="Associate" value="10" description="Team" />
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {partnerItems.map((item) => <AdminListItem key={item.label} href={item.href} isDialog={item.isDialog} DialogComponent={item.Dialog}>{item.label}</AdminListItem>)}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AdminActionButton icon={<Book />} onClick={() => router.push('/contact-book')}>Contact Book</AdminActionButton>
                <AdminActionButton icon={<WhatsAppIcon />}>WhatsApp</AdminActionButton>
                <AdminActionButton icon={<Mail />} onClick={() => router.push('/updates')}>Send Message</AdminActionButton>
            </div>
            
             <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {catalogItems.map((item) => <AdminListItem key={item.label} href={item.href} isDialog={item.isDialog} DialogComponent={item.Dialog}>{item.label}</AdminListItem>)}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {accountItems.map((item) => <AdminListItem key={item.label} href={item.href}>{item.label}</AdminListItem>)}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Components for Partner View
const PartnerStatCard = ({ title, value, description }: { title: string, value: string, description: string }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
);

const ListItem = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block w-full text-left">
        <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
            <span className="font-medium">{children}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
    </Link>
);


const PartnerBusinessDeskView = () => {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <PartnerStatCard title="Enquiry" value="1000" description="Leads" />
                <PartnerStatCard title="Customer" value="1000" description="Clients" />
                <PartnerStatCard title="Associate" value="100" description="Team" />
                <PartnerStatCard title="Leaderboard" value="10001" description="Current Rank" />
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        <ListItem href="/manage-catalog">Explore Catalog Now</ListItem>
                        <ListItem href="/enquiries">List of Enquiries</ListItem>
                        <ListItem href="/wallet-billing">Send Invoice & Bills</ListItem>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

const ManageBusinessContentSkeleton = () => (
    <div className="space-y-6">
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
      <Skeleton className="h-[180px] w-full" />
    </div>
);


export default function ManageBusinessContent() {
    const { user, loading: authLoading } = useAuth();
    const [dataLoading, setDataLoading] = React.useState(true);

    const isPartner = user?.role === 'Partner';

    React.useEffect(() => {
        // This is to prevent a flash of the wrong content while the user role is being determined.
        const timer = setTimeout(() => setDataLoading(false), 200);
        return () => clearTimeout(timer);
    }, []);
    
    if (authLoading || dataLoading) {
        return <ManageBusinessContentSkeleton />;
    }
    
    if (isPartner) {
        return <PartnerBusinessDeskView />;
    }

    // Default to admin view for non-partners
    return <AdminBusinessView />;
}
