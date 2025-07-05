'use client';

import Link from 'next/link';
import type { Role, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Building2, User as UserIcon, Globe, BookUser, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

interface AppHeaderProps {
  role: Role;
  currentUser: User;
}

export default function AppHeader({
  role,
  currentUser,
}: AppHeaderProps) {
  const sidebar = useSidebar();
  const { logout } = useAuth();
  const isAdmin = role === 'Admin';

  const showHeaderLogo =
    !isAdmin || (isAdmin && sidebar?.state === 'collapsed' && !sidebar?.isMobile);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center border-b bg-card px-2 sm:px-4 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4">
        {isAdmin && <SidebarTrigger />}
        {showHeaderLogo && (
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="hidden sm:block text-2xl font-bold text-primary font-headline">
              EstateFlow
            </h1>
          </div>
        )}
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
