
'use client';

import Link from 'next/link';
import type { Role, User } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Building2, User as UserIcon, Globe, BookUser, LogOut, Handshake, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';

interface AppHeaderProps {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: User;
}

export default function AppHeader({
  role,
  setRole,
  currentUser,
}: AppHeaderProps) {
  const sidebar = useSidebar();
  const isAdmin = role === 'Admin';
  const isPartner = role === 'Partner';

  const showHeaderLogo =
    !isAdmin || (isAdmin && sidebar?.state === 'collapsed' && !sidebar?.isMobile);

  if (isPartner) {
    const navItems = [
      { href: '/', label: 'Dashboard' },
      { href: '#', label: 'Manage Order' },
      { href: '#', label: 'Manage Business' },
      { href: '/updates', label: 'Support Ticket' },
      { href: '#', label: 'Wallet & Billing' },
    ];
    return (
      <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center border-b bg-gray-900 px-4 text-white shadow-sm">
        <div className="flex items-center gap-2">
          <Handshake className="h-8 w-8 text-white" />
          <h1 className="text-2xl font-bold font-headline">Partner</h1>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium mx-auto">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="text-gray-300 transition-colors hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <Link href="/updates" className="text-gray-300 transition-colors hover:text-white relative font-medium text-sm">
            Updates
            <span className="absolute -top-1 -right-5 text-xs bg-primary text-primary-foreground rounded-md px-1.5 py-0.5 text-[10px]">New</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-gray-800 hover:text-white p-2 text-sm">
                    My Account
                    <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile"><UserIcon className="mr-2 h-4 w-4" /><span>Manage Profile</span></Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/manage-website"><Globe className="mr-2 h-4 w-4" /><span>Manage Website</span></Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/contact-book"><BookUser className="mr-2 h-4 w-4" /><span>Contact Book</span></Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRole('Admin')} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Switch to Admin View</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center border-b bg-card px-4 shadow-sm">
      <div className="flex items-center gap-4">
        {isAdmin && <SidebarTrigger />}
        {showHeaderLogo && (
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary font-headline">
              EstateFlow
            </h1>
          </div>
        )}
      </div>

      <div className="flex flex-1 items-center justify-end space-x-4">
        <div className="w-[180px]">
          <Select value={role} onValueChange={(value: Role) => setRole(value)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Seller">Seller</SelectItem>
              <SelectItem value="Partner">Partner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage
                src={currentUser.avatar}
                alt={currentUser.name}
                data-ai-hint="person portrait"
              />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Manage Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/manage-website">
                <Globe className="mr-2 h-4 w-4" />
                <span>Manage Website</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/contact-book">
                <BookUser className="mr-2 h-4 w-4" />
                <span>Contact Book</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
