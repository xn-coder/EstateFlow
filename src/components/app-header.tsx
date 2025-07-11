'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Role, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { User as UserIcon, LogOut, Briefcase, Wallet, Globe, Book, LifeBuoy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { ADMIN_ROLES } from '@/lib/roles';
import SupportTicketDialog from './support-ticket-dialog';

interface AppHeaderProps {
  role: Role;
  currentUser: User;
}

export default function AppHeader({
  role,
  currentUser,
}: AppHeaderProps) {
  const { logout } = useAuth();
  const hasSidebar = ADMIN_ROLES.includes(role) || role === 'Partner' || role === 'Seller';
  const isAdminRole = ADMIN_ROLES.includes(role);
  const isPartner = role === 'Partner';
  const isSeller = role === 'Seller';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center border-b bg-card px-2 sm:px-4 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4">
        {hasSidebar && <SidebarTrigger />}
        <div className="flex items-center">
            <div className="block sm:hidden">
                <Image src="/logo.png" alt="EstateFlow Logo" width={32} height={32} />
            </div>
            <div className="hidden sm:block">
                <Image src="/logo-name.png" alt="EstateFlow" width={120} height={32} />
            </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
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

            {isAdminRole && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/manage-website">
                    <Globe className="mr-2 h-4 w-4" />
                    <span>Manage Website</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact-book">
                    <Book className="mr-2 h-4 w-4" />
                    <span>Contact Book</span>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            
            {isSeller && (
               <>
                  <DropdownMenuItem asChild>
                    <Link href="/manage-website">
                      <Globe className="mr-2 h-4 w-4" />
                      <span>Manage Website</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/contact-book">
                      <Book className="mr-2 h-4 w-4" />
                      <span>Contact Book</span>
                    </Link>
                  </DropdownMenuItem>
                </>
            )}

            {isPartner && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/manage-business">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Manage Business</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/wallet-billing">
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>Earning & Wallet</span>
                    </Link>
                </DropdownMenuItem>
                 <SupportTicketDialog currentUser={currentUser}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        <span>Help & Support</span>
                    </DropdownMenuItem>
                </SupportTicketDialog>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
