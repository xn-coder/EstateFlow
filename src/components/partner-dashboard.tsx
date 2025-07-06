
'use client';

import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from './ui/badge';
import BusinessReportChart from './business-report-chart';
import { Input } from './ui/input';

const PartnerHeader = ({ currentUser }: { currentUser: User }) => {
  const { logout } = useAuth();
  
  const navLinks = [
    { name: 'Dashboard', href: '/' },
    { name: 'Catalog', href: '/manage-catalog' },
    { name: 'Business Desk', href: '/manage-business' },
    { name: 'Marketing Kits', href: '/manage-marketing-kits' },
  ];

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-wider">lak desk</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  {link.name}
                </Link>
              ))}
               <Link href="/updates" className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Updates
                <Badge variant="destructive" className="absolute -top-2 -right-4 h-4 px-1.5 py-0.5 text-xs">New</Badge>
              </Link>
            </nav>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center">
                <Input placeholder="Product, Services, Solution" className="bg-gray-700 border-gray-600 text-white rounded-r-none h-9 focus:bg-gray-600" />
                <Button variant="destructive" className="rounded-l-none h-9">
                    <Search className="h-4 w-4" />
                </Button>
            </div>

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
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-4xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function PartnerDashboard({ currentUser }: { currentUser: User }) {
  const stats = [
    { title: 'New Lead', value: '100', description: 'Today' },
    { title: 'Sales', value: '300', description: 'Today' },
    { title: 'Revenue', value: '1000', description: 'Today' },
    { title: 'Rewards', value: '100', description: 'Points' },
    { title: 'Customers', value: '500', description: 'Today' },
    { title: 'Today Deals', value: '30', description: 'Offers' },
    { title: 'New Ticket', value: '1000', description: 'Ticket' },
    { title: 'Leaderbord', value: '100', description: 'Rank' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
        <PartnerHeader currentUser={currentUser} />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <Link href="#" className="text-primary hover:underline text-sm">
                dotfiv promotion content
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map(stat => (
                    <StatCard key={stat.title} title={stat.title} value={stat.value} description={stat.description} />
                ))}
            </div>
            
            <BusinessReportChart />
        </main>
    </div>
  );
}
