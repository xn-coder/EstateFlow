
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BusinessReportChart from './business-report-chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Search } from 'lucide-react';
import { getEnquiries } from '@/app/manage-orders/actions';
import { format, parseISO } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import type { SubmittedEnquiry, User } from '@/types';
import { useAuth } from '@/hooks/useAuth';

const StatCard = ({ title, value, description }: { title: string; value: string; description: string }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardDescription>{title}</CardDescription>
      <CardTitle className="text-4xl">{value}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const [enquiryData, setEnquiryData] = React.useState<SubmittedEnquiry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user: currentUser } = useAuth();

  React.useEffect(() => {
    const fetchEnquiries = async () => {
      if (currentUser) {
        setLoading(true);
        const sellerId = currentUser.role === 'Seller' ? currentUser.id : undefined;
        const data = await getEnquiries(undefined, sellerId);
        setEnquiryData(data);
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, [currentUser]);

  const totalProperties = 0; // Replace with dynamic data if needed
  const totalUsers = 0;
  const totalLeads = enquiryData.length;
  const totalPartners = 0;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Properties" value={totalProperties.toString()} description="Listed on the platform" />
        <StatCard title="Total Users" value={totalUsers.toString()} description="Admin, Sellers, and Partners" />
        <StatCard title="Total Leads" value={loading ? '...' : totalLeads.toString()} description="Generated from properties" />
        <StatCard title="Total Partners" value={totalPartners.toString()} description="Agent partners" />
      </div>

      <BusinessReportChart />
      
      <Card>
        <CardContent className="p-4 sm:p-6">
           <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Select defaultValue="10">
                <SelectTrigger className="w-auto bg-white dark:bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground hidden md:inline-block">entries per page</span>
            </div>
            <div className="relative w-full sm:w-auto sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10 bg-white dark:bg-background" />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><button className="flex items-center gap-1">Enquiry ID <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead className="hidden md:table-cell"><button className="flex items-center gap-1">Phone Number <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead className="hidden lg:table-cell"><button className="flex items-center gap-1">Partner ID <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Catalog Name <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead className="hidden lg:table-cell"><button className="flex items-center gap-1">Catalog Code <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : enquiryData.length > 0 ? (
                    enquiryData.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                        <TableCell>{enquiry.enquiryId}</TableCell>
                        <TableCell>{format(parseISO(enquiry.createdAt), 'dd MMM yyyy')}</TableCell>
                        <TableCell>{enquiry.customerName}</TableCell>
                        <TableCell className="hidden md:table-cell">{enquiry.customerPhone}</TableCell>
                        <TableCell className="hidden lg:table-cell">{enquiry.submittedBy.name}</TableCell>
                        <TableCell>{enquiry.catalogTitle}</TableCell>
                        <TableCell className="hidden lg:table-cell">{enquiry.catalogCode}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={7} className="h-24 text-center">No enquiries found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-muted-foreground gap-4 sm:gap-0">
            <div>Showing 1 to {enquiryData.length} of {enquiryData.length} entries</div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled>«</Button>
              <Button variant="outline" size="sm" disabled>‹</Button>
              <Button variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/20">1</Button>
              <Button variant="outline" size="sm" disabled>›</Button>
              <Button variant="outline" size="sm" disabled>»</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
