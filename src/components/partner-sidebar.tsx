
'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Megaphone,
  Bell,
  BookCopy,
} from 'lucide-react';

export default function PartnerSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="border-b">
        <div className="flex h-12 items-center justify-center gap-2 px-2">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary font-headline group-data-[collapsible=icon]:hidden">
            EstateFlow
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/" isActive={pathname === '/'} tooltip="Dashboard">
              <LayoutDashboard />
              Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton href="/manage-catalog" isActive={pathname.startsWith('/manage-catalog')} tooltip="Catalog">
              <BookCopy />
              Catalog
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton href="/manage-business" isActive={pathname.startsWith('/manage-business')} tooltip="Business Desk">
              <Briefcase />
              Business Desk
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton href="/manage-marketing-kits" isActive={pathname.startsWith('/manage-marketing-kits')} tooltip="Marketing Kits">
              <Megaphone />
              Marketing Kits
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/updates" isActive={pathname === '/updates'} tooltip="Updates">
              <Bell />
              Updates
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
