'use client';

import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import Image from 'next/image';

interface AdminSidebarProps {
  role: Role;
}

export default function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === 'Admin';
  const isManager = role === 'Manager';
  const isBusinessManager = role === 'Business Manager';
  const isSupportTeam = role === 'Support Team';
  const isWalletManager = role === 'Wallet Manager';
  const isSeller = role === 'Seller';

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
          {(isAdmin || isManager || isSeller) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="/manage-orders" isActive={pathname.startsWith('/manage-orders')} tooltip="Manage Orders">
                <ShoppingCart />
                Manage Orders
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {(isAdmin || isManager || isBusinessManager || isSeller) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="/manage-business" isActive={pathname.startsWith('/manage-business')} tooltip="Manage Business">
                <Briefcase />
                Manage Business
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {(isAdmin || isSupportTeam) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="/support-ticket" isActive={pathname === '/support-ticket'} tooltip="Support Ticket">
                <LifeBuoy />
                Support Ticket
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {(isAdmin || isWalletManager || isSeller) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="/wallet-billing" isActive={pathname === '/wallet-billing' || pathname.startsWith('/receivable') || pathname.startsWith('/payable') || pathname.startsWith('/payment-history')} tooltip="Wallet & Billing">
                <Wallet />
                Wallet & Billing
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {(isAdmin || isManager || isBusinessManager || isSupportTeam || isWalletManager || isSeller) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="/updates" isActive={pathname === '/updates'} tooltip="Updates">
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
