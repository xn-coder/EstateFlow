
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BusinessReportChart from './business-report-chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';
import { enquiries } from '@/lib/data';

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

export default function PartnerDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Projects" value="300" description="Properties" />
        <StatCard title="Enquiry" value="1000" description="Leads" />
        <StatCard title="Booking" value="1000" description="Earning" />
        <StatCard title="Partner" value="1100" description="Agents" />
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
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                        <TableCell>{enquiry.enquiryId}</TableCell>
                        <TableCell>{enquiry.date}</TableCell>
                        <TableCell>{enquiry.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{enquiry.phone}</TableCell>
                        <TableCell className="hidden lg:table-cell">{enquiry.partnerId}</TableCell>
                        <TableCell>{enquiry.catalogName}</TableCell>
                        <TableCell className="hidden lg:table-cell">{enquiry.catalogCode}</TableCell>
                        <TableCell className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600 h-6 w-6">
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-orange-500 hover:text-orange-600 h-6 w-6">
                                <AlertTriangle className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 h-6 w-6">
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-muted-foreground gap-4 sm:gap-0">
            <div>Showing 1 to {enquiries.length} of {enquiries.length} entries</div>
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
