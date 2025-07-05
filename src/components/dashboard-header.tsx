"use client"

import { Building2 } from 'lucide-react';
import type { Role, User } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardHeaderProps {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: User;
}

export default function DashboardHeader({ role, setRole, currentUser }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary font-headline">EstateFlow</h1>
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
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} data-ai-hint="person portrait" />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
