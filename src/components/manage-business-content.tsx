
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Book, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const StatCard = ({ title, value, description }: { title: string; value: string; description: string; }) => (
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

const ListItem = ({ children, href = "#" }: { children: React.ReactNode; href?: string; }) => (
    <Link href={href} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors">
        <span className="font-medium">{children}</span>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
);

const ActionButton = ({ children, icon, onClick }: { children: React.ReactNode; icon: React.ReactNode; onClick?: () => void; }) => (
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


export default function ManageBusinessContent() {
    const router = useRouter();

    const partnerItems = [
        { label: 'Manage Partner', href: '#' },
        { label: 'Partner Activation', href: '/partner-activation' },
        { label: 'Deactivated Partner', href: '#' },
        { label: 'Manage Customer', href: '#' },
        { label: 'Manage Access', href: '#' },
        { label: 'Give Access', href: '#' },
    ];

    const catalogItems = [
        'Add a Catalog',
        'Manage Catalog',
        'Add a Marketing Kits',
        'Manage Marketing Kits',
        'Add a New Category',
        'Manage Category',
        'Manage a Content',
        'Post a Content',
    ];
    
    const accountItems = [
        { label: 'Leaderboard', href: '#' },
        { label: 'Manage Website', href: '/manage-website' },
        { label: 'My Account', href: '/profile' },
    ];


    return (
        <div className="space-y-6 max-w-7xl mx-auto">
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Sales" value="1000" description="Order" />
                <StatCard title="Partner" value="1000" description="Members" />
                <StatCard title="Customer" value="100" description="User" />
                <StatCard title="Associate" value="10" description="Team" />
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {partnerItems.map((item) => <ListItem key={item.label} href={item.href}>{item.label}</ListItem>)}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionButton icon={<Book />} onClick={() => router.push('/contact-book')}>Contact Book</ActionButton>
                <ActionButton icon={<WhatsAppIcon />}>WhatsApp</ActionButton>
                <ActionButton icon={<Mail />} onClick={() => router.push('/updates')}>Send Message</ActionButton>
            </div>
            
             <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {catalogItems.map((item) => <ListItem key={item}>{item}</ListItem>)}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {accountItems.map((item) => <ListItem key={item.label} href={item.href}>{item.label}</ListItem>)}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
