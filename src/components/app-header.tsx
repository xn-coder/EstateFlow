'use client';

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
import { Building2 } from 'lucide-react';

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

  const showHeaderLogo =
    !isAdmin || (isAdmin && sidebar?.state === 'collapsed' && !sidebar?.isMobile);

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
        <Avatar>
          <AvatarImage
            src={currentUser.avatar}
            alt={currentUser.name}
            data-ai-hint="person portrait"
          />
          <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
