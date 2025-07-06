

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { PartnerActivationInfo, WebsiteData, Category } from '@/types';
import { getPartnerById } from '@/app/manage-partner/actions';
import { getWebsiteData } from '@/app/manage-website/actions';
import { Skeleton } from './ui/skeleton';
import { Settings, Share2, ChevronRight, Book, Mail } from 'lucide-react';
import Image from 'next/image';
import AddMarketingKitDialog from './add-marketing-kit-dialog';
import AddCategoryDialog from './add-category-dialog';
import AddContentDialog from './add-content-dialog';
import AddUserDialog from './add-user-dialog';
import { getCategories } from '@/app/manage-category/actions';
import EditLegalInfoDialog from './edit-legal-info-dialog';
import EditLinkDetailsDialog from './edit-link-details-dialog';
import EditPartnerBusinessDetailsDialog from './edit-partner-business-details-dialog';
import EditPartnerBusinessLogoDialog from './edit-partner-business-logo-dialog';
import EditPartnerDigitalCardDialog from './edit-partner-digital-card-dialog';


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

// --- Partner-facing components for the new layout ---
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

const EditableCard = ({ title, children, editAction, shareAction }: { title: string; children: React.ReactNode; editAction?: React.ReactNode; shareAction?: boolean; }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <div className="flex items-center gap-1">
                {shareAction && <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>}
                {editAction}
            </div>
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
    </Card>
);

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <div className="flex justify-between py-2 border-b last:border-b-0 text-sm">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium text-right">{value || 'N/A'}</p>
    </div>
);

const PartnerBusinessView = ({ partnerInfo, websiteData, onUpdate }: { partnerInfo: PartnerActivationInfo, websiteData: WebsiteData, onUpdate: () => void }) => {
    const { profile } = partnerInfo;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <PartnerStatCard title="Enquiry" value="100" description="Leads" />
                <PartnerStatCard title="Associate" value="100" description="Team" />
                <PartnerStatCard title="Revenue" value="1000 INR" description="Weekly Earning" />
                <PartnerStatCard title="Leaderboard" value="10001" description="Current Rank" />
            </div>

            <EditableCard 
                title="Business Details" 
                editAction={
                    <EditPartnerBusinessDetailsDialog partnerInfo={partnerInfo} onUpdate={onUpdate}>
                        <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
                    </EditPartnerBusinessDetailsDialog>
                }
            >
                <DetailRow label="Business Type" value={profile.businessType} />
                <DetailRow label="Business Name" value={profile.name} />
                <DetailRow label="GSTN" value={profile.gstn} />
                <DetailRow label="Age Of Business" value={`${profile.businessAge} Month`} />
                <DetailRow label="Area Covered" value={profile.areaCovered} />
            </EditableCard>
            
            <EditableCard 
                title="Business Logo" 
                editAction={
                    <EditPartnerBusinessLogoDialog partnerInfo={partnerInfo} onUpdate={onUpdate}>
                        <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
                    </EditPartnerBusinessLogoDialog>
                }
            >
                <div className="flex justify-center p-4">
                    <Image src={profile.businessLogo || "https://placehold.co/128x128.png"} alt="Business Logo" width={128} height={128} className="rounded-lg" data-ai-hint="company logo" />
                </div>
            </EditableCard>

            <EditableCard 
                title="Digital Card" 
                editAction={
                    <EditPartnerDigitalCardDialog partnerInfo={partnerInfo} onUpdate={onUpdate}>
                        <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
                    </EditPartnerDigitalCardDialog>
                } 
                shareAction
            >
                 <DetailRow label="Your Name" value={profile.name} />
                 <DetailRow label="Position" value={profile.position || 'Director'} />
                 <DetailRow label="Display Phone Number" value={profile.phone} />
                 <DetailRow label="Display Email" value={profile.email} />
                 <DetailRow label="Address" value={`${profile.address}, ${profile.city}, ${profile.state}, India`} />
                 <div className="pt-2"><Button variant="link" className="p-0 h-auto">View Card</Button></div>
            </EditableCard>

            <EditableCard 
                title="Website Setting" 
                editAction={
                    <EditLegalInfoDialog legalInfo={websiteData.legalInfo} onUpdate={onUpdate}>
                        <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
                    </EditLegalInfoDialog>
                } 
                shareAction
            >
                 <DetailRow label="About Page" value={<span className="line-clamp-3 text-right">{websiteData.legalInfo.about}</span>} />
                 <DetailRow label="Terms Of Services" value={<a href={websiteData.legalInfo.terms} className="text-primary hover:underline truncate block w-48 sm:w-auto" target="_blank" rel="noopener noreferrer">{websiteData.legalInfo.terms}</a>} />
                 <DetailRow label="Privacy policy" value={<a href={websiteData.legalInfo.privacy} className="text-primary hover:underline truncate block w-48 sm:w-auto" target="_blank" rel="noopener noreferrer">{websiteData.legalInfo.privacy}</a>} />
                 <DetailRow label="Refund policy" value={<a href={websiteData.legalInfo.refund} className="text-primary hover:underline truncate block w-48 sm:w-auto" target="_blank" rel="noopener noreferrer">{websiteData.legalInfo.refund}</a>} />
                 <DetailRow label="Disclaimer" value={<a href={websiteData.legalInfo.disclaimer} className="text-primary hover:underline truncate block w-48 sm:w-auto" target="_blank" rel="noopener noreferrer">{websiteData.legalInfo.disclaimer}</a>} />
                 <div className="pt-2"><Button variant="link" className="p-0 h-auto">View Website</Button></div>
            </EditableCard>

            <EditableCard 
                title="Your Link Details" 
                editAction={
                    <EditLinkDetailsDialog links={websiteData.links} onUpdate={onUpdate}>
                         <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
                    </EditLinkDetailsDialog>
                } 
                shareAction
            >
                 <DetailRow label="Website" value={<a href={websiteData.links.website} className="text-primary hover:underline truncate block w-48 sm:w-auto" target="_blank" rel="noopener noreferrer">{websiteData.links.website}</a>} />
                 <DetailRow label="Facebook" value={<a href={websiteData.links.facebook} className="text-primary hover:underline truncate block w-48 sm:w-auto" target="_blank" rel="noopener noreferrer">{websiteData.links.facebook}</a>} />
                 <DetailRow label="Instagram" value={<a href={websiteData.links.instagram} className="text-primary hover:underline truncate block w-48 sm:w-auto" target="_blank" rel="noopener noreferrer">{websiteData.links.instagram}</a>} />
                 <DetailRow label="LinkedIn" value={<a href={websiteData.links.linkedin} className="text-primary hover:underline truncate block w-48 sm:w-auto" target="_blank" rel="noopener noreferrer">{websiteData.links.linkedin}</a>} />
                 <DetailRow label="YouTube" value={<a href={websiteData.links.youtube} className="text-primary hover:underline truncate block w-48 sm:w-auto" target="_blank" rel="noopener noreferrer">{websiteData.links.youtube}</a>} />
            </EditableCard>
        </div>
    );
};

const ManageBusinessContentSkeleton = () => (
    <div className="space-y-6">
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
      <Skeleton className="h-[250px] w-full" />
      <Skeleton className="h-[180px] w-full" />
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[280px] w-full" />
      <Skeleton className="h-[280px] w-full" />
    </div>
);


export default function ManageBusinessContent() {
    const { user, loading: authLoading } = useAuth();
    const [partnerInfo, setPartnerInfo] = React.useState<PartnerActivationInfo | null>(null);
    const [websiteData, setWebsiteData] = React.useState<WebsiteData | null>(null);
    const [dataLoading, setDataLoading] = React.useState(true);

    const isPartner = user?.role === 'Partner';

    const fetchData = React.useCallback(async () => {
        if (isPartner && user) {
            setDataLoading(true);
            const [pInfo, wData] = await Promise.all([
                getPartnerById(user.id),
                getWebsiteData(),
            ]);
            setPartnerInfo(pInfo);
            setWebsiteData(wData);
            setDataLoading(false);
        } else {
            setDataLoading(false);
        }
    }, [isPartner, user]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    if (authLoading || (isPartner && dataLoading)) {
        return <ManageBusinessContentSkeleton />;
    }
    
    if (isPartner && partnerInfo && websiteData) {
        return <PartnerBusinessView partnerInfo={partnerInfo} websiteData={websiteData} onUpdate={fetchData} />;
    }

    // Default to admin view for non-partners
    return <AdminBusinessView />;
}
