
'use client';

import type { Role } from '@/types';
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
  ShoppingCart,
  Briefcase,
  LifeBuoy,
  Wallet,
  Bell,
  Building2,
} from 'lucide-react';

interface AdminSidebarProps {
  role: Role;
}

export default function AdminSidebar({ role }: AdminSidebarProps) {
  const isAdmin = role === 'Admin';
  const isManager = role === 'Manager';
  const isBusinessManager = role === 'Business Manager';
  const isSupportTeam = role === 'Support Team';
  const isWalletManager = role === 'Wallet Manager';

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
            <SidebarMenuButton href="/" isActive tooltip="Dashboard">
              <LayoutDashboard />
              Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
          {(isAdmin || isManager) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Manage Orders">
                <ShoppingCart />
                Manage Orders
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {(isAdmin || isManager || isBusinessManager) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="#" tooltip="Manage Business">
                <Briefcase />
                Manage Business
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {(isAdmin || isSupportTeam) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="/updates" tooltip="Support Ticket">
                <LifeBuoy />
                Support Ticket
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {(isAdmin || isWalletManager) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="/wallet-billing" tooltip="Wallet & Billing">
                <Wallet />
                Wallet & Billing
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {(isAdmin || isManager || isBusinessManager || isSupportTeam || isWalletManager) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="/updates" tooltip="Updates">
                <Bell />
                Updates
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
