'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye, Printer, CheckCircle, ArrowUpDown } from 'lucide-react';
import { receivables } from '@/lib/data';
import { Badge } from './ui/badge';

export default function ReceivableCashListContent() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Receivable Cash List</CardTitle>
          <CardDescription>A list of pending payments from partners.</CardDescription>
        </CardHeader>
        <CardContent>
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
              <Input placeholder="Search by partner..." className="pl-10 bg-white dark:bg-background" />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><button className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Partner Name <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead className="hidden md:table-cell"><button className="flex items-center gap-1">Partner ID <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Pending Amount <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivables.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="font-medium">{item.partnerName}</TableCell>
                        <TableCell className="hidden md:table-cell">{item.partnerId}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {item.pendingAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-green-600 h-8 w-8" title="Mark as Paid">
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary h-8 w-8" title="View Details">
                                <Eye className="h-4 w-4" />
                            </Button>
                             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8" title="Print Invoice">
                                <Printer className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-muted-foreground gap-4 sm:gap-0">
            <div>Showing 1 to {receivables.length} of {receivables.length} entries</div>
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
