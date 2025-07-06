
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Megaphone,
  Bell,
  BookCopy,
  ChevronRight,
} from 'lucide-react';
import { getCatalogs } from '@/app/add-catalog/actions';
import type { Catalog } from '@/types';
import { cn } from '@/lib/utils';

export default function PartnerSidebar() {
  const pathname = usePathname();
  const [catalogs, setCatalogs] = React.useState<Catalog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCatalogOpen, setIsCatalogOpen] = React.useState(
    pathname.startsWith('/manage-catalog')
  );

  React.useEffect(() => {
    setIsCatalogOpen(pathname.startsWith('/manage-catalog'));
  }, [pathname]);

  React.useEffect(() => {
    async function fetchCatalogsData() {
      setLoading(true);
      const fetchedCatalogs = await getCatalogs();
      setCatalogs(fetchedCatalogs);
      setLoading(false);
    }
    fetchCatalogsData();
  }, []);

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
            <SidebarMenuButton
              onClick={() => setIsCatalogOpen((prev) => !prev)}
              isActive={pathname.startsWith('/manage-catalog')}
              className="w-full justify-between"
              tooltip="Catalog"
            >
              <div className="flex items-center gap-2">
                <BookCopy />
                <span>Catalog</span>
              </div>
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform duration-200 group-data-[collapsible=icon]:hidden',
                  isCatalogOpen && 'rotate-90'
                )}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {isCatalogOpen && (
            <div className="group-data-[collapsible=icon]:hidden">
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton href="/manage-catalog" isActive={pathname === '/manage-catalog'}>
                    Manage All
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                {loading ? (
                  <SidebarMenuSubItem><SidebarMenuSkeleton showIcon={false}/></SidebarMenuSubItem>
                ) : (
                  catalogs.map((catalog) => (
                    <SidebarMenuSubItem key={catalog.id}>
                      <SidebarMenuSubButton href={`/manage-catalog/${catalog.id}`} isActive={pathname === `/manage-catalog/${catalog.id}`}>
                        {catalog.title}
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))
                )}
              </SidebarMenuSub>
            </div>
          )}
          
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
