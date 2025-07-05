
'use client';

import type { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Mail, Phone, Settings, ChevronRight, LogOut, User as UserIcon, Handshake, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import DashboardFooter from './dashboard-footer';
import { Badge } from './ui/badge';

const PartnerHeader = ({ currentUser }: { currentUser: User }) => {
  const { logout } = useAuth();
  
  const navLinks = [
    { name: 'Dashboard', href: '/' },
    { name: 'Manage Order', href: '#' },
    { name: 'Manage Business', href: '#' },
    { name: 'Support Ticket', href: '#' },
    { name: 'Wallet & Billing', href: '#' },
  ];

  return (
    <header className="bg-gray-800 text-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Handshake className="h-7 w-7" />
          <span className="text-xl font-bold">Partner</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
            <Link href="/updates" className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Updates
              <Badge className="absolute -top-2 -right-4 h-4 px-1.5 py-0.5 text-xs">New</Badge>
            </Link>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-300 hover:bg-gray-700 hover:text-white">
                  My Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{currentUser.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>My Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

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
    <div className="flex justify-between py-3 border-b border-gray-200 text-sm">
      <p className="font-medium text-gray-500">{label}</p>
      <p className="text-gray-900">{value}</p>
    </div>
  );

const ActionButton = ({ children, icon }: { children: React.ReactNode; icon: React.ReactNode; }) => (
    <Button variant="outline" className="w-full justify-between h-12 text-base font-normal">
      <span>{children}</span>
      {icon}
    </Button>
);

const ListItem = ({ children, href = "#" }: { children: React.ReactNode; href?: string; }) => (
    <Link href={href} className="block w-full text-left">
        <div className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
            <span className="font-medium text-sm">{children}</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
    </Link>
);


export default function PartnerDashboard({ currentUser }: { currentUser: User }) {
    const listItems = [
        { label: 'Order Details' },
        { label: 'Manage Customer' },
        { label: 'Withdrawal Request' },
        { label: 'Receivable Cash List' },
        { label: 'Send Rewards Point' },
        { label: 'Billing and Invoice' },
        { label: 'Payment History' },
        { label: 'Deactivated Account' },
        { label: 'Change Password' }
    ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <PartnerHeader currentUser={currentUser} />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
            <Card>
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border">
                            <AvatarImage src={currentUser.avatar} alt={currentUser.name} data-ai-hint="person" />
                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold">{currentUser.name}</h2>
                            <p className="text-sm text-muted-foreground">{currentUser.partnerCode || 'DSA 000 000 001'}</p>
                        </div>
                    </div>
                     <Button variant="ghost" size="icon">
                        <Mail className="h-5 w-5" />
                    </Button>
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
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <DetailRow label="Contact Name" value={currentUser.name} />
                    <DetailRow label="Phone Number" value={currentUser.phone || '+91 998 877 6655'} />
                    <DetailRow label="Email Details" value={currentUser.email} />
                    <DetailRow label="WhatsApp No." value="+91 998 877 6655" />
                    <DetailRow label="Address" value="Nagpur Maharashtra India" />
                    <DetailRow label="City & State" value="Nagpur - Maharashtra" />
                    <DetailRow label="Pin Code" value="440009" />
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionButton icon={<Mail />}>Send Message</ActionButton>
                <ActionButton icon={<MessageSquare />}>WhatsApp</ActionButton>
                <ActionButton icon={<Phone />}>Call Now</ActionButton>
            </div>
            
            <Card>
                <CardContent className="p-0">
                     <div className="divide-y">
                        {listItems.map((item) => <ListItem key={item.label}>{item.label}</ListItem>)}
                    </div>
                </CardContent>
            </Card>
        </main>
        <DashboardFooter />
    </div>
  );
}
