'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';
import Image from 'next/image';
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
  Briefcase,
  Megaphone,
  Bell,
  BookCopy,
  Wallet,
  Trophy,
  Gift,
  Hourglass,
} from 'lucide-react';

export default function PartnerSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="border-b">
        <div className="flex h-12 items-center justify-center">
             <div className="hidden group-data-[collapsible=icon]:block">
                <Image src="/logo.png" alt="EstateFlow Logo" width={32} height={32} />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
                <Image src="/logo-name.png" alt="EstateFlow" width={120} height={32} />
            </div>
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
            <SidebarMenuButton href="/pending-payments" isActive={pathname.startsWith('/pending-payments')} tooltip="Pending Payments">
              <Hourglass />
              Pending Payments
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton href="/wallet-billing" isActive={pathname.startsWith('/wallet-billing')} tooltip="Earning & Wallet">
              <Wallet />
              Earning & Wallet
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton href="/manage-marketing-kits" isActive={pathname.startsWith('/manage-marketing-kits')} tooltip="Marketing Kits">
              <Megaphone />
              Marketing Kits
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton href="/leaderboard" isActive={pathname.startsWith('/leaderboard')} tooltip="Leaderboard">
              <Trophy />
              Leaderboard
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="/reward-points-history" isActive={pathname.startsWith('/reward-points-history')} tooltip="Rewards History">
              <Gift />
              Rewards
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
