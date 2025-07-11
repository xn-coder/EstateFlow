

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { Category, WebsiteData, User } from '@/types';
import { Skeleton } from './ui/skeleton';
import { ChevronRight, Book, Mail, Pencil } from 'lucide-react';
import AddMarketingKitDialog from './add-marketing-kit-dialog';
import AddCategoryDialog from './add-category-dialog';
import AddContentDialog from './add-content-dialog';
import AddUserDialog from './add-user-dialog';
import { getCategories } from '@/app/manage-category/actions';
import { getPartnerFees } from '@/app/manage-website/actions';
import { feeApplicablePartnerCategories } from '@/types';
import { getEnquiries } from '@/app/manage-orders/actions';
import { getCustomers } from '@/app/manage-customers/actions';
import { getActivePartners } from '@/app/manage-partner/actions';
import { getUsers } from '@/app/login/actions';
import { ADMIN_ROLES } from '@/lib/roles';
import EditPartnerFeesDialog from './edit-partner-fees-dialog';


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
    const [partnerFees, setPartnerFees] = React.useState<WebsiteData['partnerFees'] | null>(null);
    const [stats, setStats] = React.useState({ sales: 0, partners: 0, customers: 0, associates: 0 });
    const [loading, setLoading] = React.useState(true);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        const [fetchedCategories, fetchedFees, enquiries, partners, customers, allUsers] = await Promise.all([
            getCategories(),
            getPartnerFees(),
            getEnquiries(),
            getActivePartners(),
            getCustomers(),
            getUsers(),
        ]);
        setCategories(fetchedCategories);
        setPartnerFees(fetchedFees);

        const sales = enquiries.filter(e => e.status === 'Confirmed' || e.status === 'Closed').length;
        const associates = allUsers.filter(u => ADMIN_ROLES.includes(u.role)).length;
        setStats({
            sales,
            partners: partners.length,
            customers: customers.length,
            associates,
        });

        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const AdminStatCard = ({ title, value, description, loading }: { title: string; value: string; description: string; loading?: boolean }) => (
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">{title}</CardTitle>
          {loading ? <Skeleton className="h-9 w-1/2 mt-1" /> : <p className="text-3xl font-bold">{value}</p>}
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    );

    const partnerItems = [
        { label: 'Manage Partner', href: '/manage-partner' },
        { label: 'Manage Seller', href: '/manage-seller' },
        { label: 'Partner Activation', href: '/partner-activation' },
        { label: 'Deactivated Partner', href: '/deactivated-partner' },
        { label: 'Manage Customer', href: '/manage-customers' },
        { label: 'Manage Access', href: '/manage-access' },
        { label: 'Give Access', isDialog: true, Dialog: <AddUserDialog onUserAdded={() => {}} /> },
    ];

    const catalogItems = [
        { label: 'Add a Catalog', href: '/add-catalog' },
        { label: 'Manage Catalog', href: '/manage-catalog' },
        { label: 'Add a Category', isDialog: true, Dialog: <AddCategoryDialog onCategoryAdded={fetchData} /> },
        { label: 'Manage Categories', href: '/manage-category' },
        { label: 'Add Content', isDialog: true, Dialog: <AddContentDialog categories={categories} onContentAdded={() => {}} /> },
        { label: 'Manage Content', href: '/manage-content' },
        { label: 'Add a Marketing Kit', isDialog: true, Dialog: <AddMarketingKitDialog onKitAdded={() => {}} /> },
        { label: 'Manage Marketing Kits', href: '/manage-marketing-kits' },
    ];
    
    const accountItems = [
        { label: 'Leaderboard', href: '/leaderboard' },
        { label: 'Manage Website', href: '/manage-website' },
        { label: 'My Account', href: '/profile' },
    ];
    
    const PartnerFeesCard = ({ partnerFees, fetchData }: { partnerFees: WebsiteData['partnerFees'] | null; fetchData: () => void; }) => (
        <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Partner Registration Fees</CardTitle>
                    <CardDescription>Fees associated with different partner tiers.</CardDescription>
                </div>
                {partnerFees && (
                    <EditPartnerFeesDialog partnerFees={partnerFees} onUpdate={fetchData}>
                        <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </EditPartnerFeesDialog>
                )}
            </CardHeader>
            <CardContent>
                <div className="divide-y">
                    {partnerFees ? (
                        feeApplicablePartnerCategories.map((category) => (
                            <div key={category} className="flex justify-between items-center py-3">
                                <span className="text-sm font-medium">{category}</span>
                                <span className="text-sm font-semibold">
                                    {partnerFees[category] ? `₹${partnerFees[category]?.toLocaleString()}` : 'Not Set'}
                                </span>
                            </div>
                        ))
                    ) : (
                        [...Array(3)].map((_, i) => (
                           <div key={i} className="flex justify-between items-center py-3">
                               <Skeleton className="h-5 w-40" />
                               <Skeleton className="h-5 w-16" />
                           </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );


    return (
        <div className="space-y-6 max-w-7xl mx-auto">
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <AdminStatCard title="Sales" value={stats.sales.toString()} description="Order" loading={loading} />
                <AdminStatCard title="Partner" value={stats.partners.toString()} description="Members" loading={loading} />
                <AdminStatCard title="Customer" value={stats.customers.toString()} description="User" loading={loading} />
                <AdminStatCard title="Associate" value={stats.associates.toString()} description="Team" loading={loading} />
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

            <PartnerFeesCard partnerFees={partnerFees} fetchData={fetchData} />

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

const SellerBusinessView = () => {
    const [categories, setCategories] = React.useState<Category[]>([]);
    const fetchData = React.useCallback(async () => {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const SellerStatCard = ({ title, value, description }: { title: string; value: string; description: string; }) => (
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

    const catalogItems = [
        { label: 'Add a Catalog', href: '/add-catalog' },
        { label: 'Manage Catalog', href: '/manage-catalog' },
        { label: 'Add a Category', isDialog: true, Dialog: <AddCategoryDialog onCategoryAdded={fetchData} /> },
        { label: 'Manage Categories', href: '/manage-category' },
        { label: 'Add Content', isDialog: true, Dialog: <AddContentDialog categories={categories} onContentAdded={() => {}} /> },
        { label: 'Manage Content', href: '/manage-content' },
        { label: 'Add a Marketing Kit', isDialog: true, Dialog: <AddMarketingKitDialog onKitAdded={() => {}} /> },
        { label: 'Manage Marketing Kits', href: '/manage-marketing-kits' },
    ];
    
    const accountItems = [
        { label: 'Manage Customers', href: '/manage-customers' },
        { label: 'Leaderboard', href: '/leaderboard' },
        { label: 'Manage Website', href: '/manage-website' },
        { label: 'My Account', href: '/profile' },
    ];
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <SellerStatCard title="Sales" value="1000" description="Order" />
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
};


// Components for Partner View
const PartnerStatCard = ({ title, value, description, loading }: { title: string, value: string, description: string, loading: boolean }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
            <Skeleton className="h-10 w-3/4 mb-1" />
        ) : (
            <p className="text-4xl font-bold">{value}</p>
        )}
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
    const { user: currentUser } = useAuth();
    const [stats, setStats] = React.useState({
        enquiries: 0,
        customers: 0,
        leaderboardRank: 'N/A',
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDeskData = async () => {
            if (!currentUser) return;
            setLoading(true);

            try {
                const [enquiryData, customerData, leaderboardData] = await Promise.all([
                    getEnquiries(currentUser.id),
                    getCustomers(currentUser.id),
                    getLeaderboardData(),
                ]);

                const rankIndex = leaderboardData.findIndex(entry => entry.partner.id === currentUser.id);
                const rank = rankIndex !== -1 ? (rankIndex + 1).toString() : 'N/A';

                setStats({
                    enquiries: enquiryData.length,
                    customers: customerData.length,
                    leaderboardRank: rank,
                });

            } catch (error) {
                console.error("Failed to fetch partner business desk data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchDeskData();
        }
    }, [currentUser]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <PartnerStatCard title="Enquiry" value={stats.enquiries.toString()} description="Leads" loading={loading} />
                <PartnerStatCard title="Customer" value={stats.customers.toString()} description="Clients" loading={loading} />
                <PartnerStatCard title="Leaderboard" value={stats.leaderboardRank} description="Current Rank" loading={loading} />
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        <ListItem href="/manage-catalog">Explore Catalog Now</ListItem>
                        <ListItem href="/enquiries">List of Enquiries</ListItem>
                        <ListItem href="/pending-payments">Pending Customer Payments</ListItem>
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

    React.useEffect(() => {
        // This is to prevent a flash of the wrong content while the user role is being determined.
        const timer = setTimeout(() => setDataLoading(false), 200);
        return () => clearTimeout(timer);
    }, []);
    
    if (authLoading || dataLoading || !user) {
        return <ManageBusinessContentSkeleton />;
    }
    
    if (user.role === 'Partner') {
        return <PartnerBusinessDeskView />;
    }

    if (user.role === 'Seller') {
        return <SellerBusinessView />;
    }

    // Default to admin view for non-partners
    return <AdminBusinessView />;
}
