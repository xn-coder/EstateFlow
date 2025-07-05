
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  ShoppingCart,
  Briefcase,
  LifeBuoy,
  Wallet,
  Bell,
  Building2,
  ChevronDown,
} from 'lucide-react';
import * as React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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
  
  const walletPages = ['/wallet-billing', '/receivable-cash-list', '/payable-list', '/payment-history'];
  const [isWalletMenuOpen, setIsWalletMenuOpen] = React.useState(walletPages.some(p => pathname.startsWith(p)));


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
          {(isAdmin || isManager) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="#" isActive={pathname.startsWith('/orders')} tooltip="Manage Orders">
                <ShoppingCart />
                Manage Orders
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {(isAdmin || isManager || isBusinessManager) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="#" isActive={pathname.startsWith('/business')} tooltip="Manage Business">
                <Briefcase />
                Manage Business
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {(isAdmin || isSupportTeam) && (
            <SidebarMenuItem>
              <SidebarMenuButton href="/updates" isActive={pathname === '/updates'} tooltip="Support Ticket">
                <LifeBuoy />
                Support Ticket
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {(isAdmin || isWalletManager) && (
            <Collapsible asChild open={isWalletMenuOpen} onOpenChange={setIsWalletMenuOpen}>
              <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                     <SidebarMenuButton
                        isActive={walletPages.some(p => pathname.startsWith(p))}
                        className="w-full justify-between group-data-[collapsible=icon]:justify-center"
                      >
                       <div className="flex items-center gap-2">
                          <Wallet />
                          <span className="group-data-[collapsible=icon]:hidden">Wallet & Billing</span>
                       </div>
                        <ChevronDown
                          className={cn(
                            "transition-transform duration-200 group-data-[collapsible=icon]:hidden",
                            isWalletMenuOpen && "rotate-180"
                          )}
                        />
                      </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/wallet-billing" isActive={pathname === '/wallet-billing'}>
                            Overview
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/receivable-cash-list" isActive={pathname === '/receivable-cash-list'}>
                            Receivable List
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/payable-list" isActive={pathname === '/payable-list'}>
                            Payable List
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton href="/payment-history" isActive={pathname === '/payment-history'}>
                            Payment History
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                  </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )}
          {(isAdmin || isManager || isBusinessManager || isSupportTeam || isWalletManager) && (
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
