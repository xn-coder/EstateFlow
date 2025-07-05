
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { MarketingKitInfo } from '@/types';
import { getMarketingKits } from '@/app/add-catalog/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowUpDown, Edit, Trash2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

export default function ManageMarketingKitsContent() {
  const [kits, setKits] = React.useState<MarketingKitInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchKits = React.useCallback(async () => {
    setLoading(true);
    const data = await getMarketingKits();
    setKits(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchKits();
  }, [fetchKits]);

  const handleEdit = (id: string) => {
    toast({ title: 'Info', description: `Edit functionality for kit ${id} is not implemented yet.` });
  };

  const handleDelete = (id: string) => {
    toast({ title: 'Info', description: `Delete functionality for kit ${id} is not implemented yet.` });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.push('/manage-business')}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <div>
                <CardTitle>Manage Marketing Kits</CardTitle>
                <CardDescription>View all marketing materials across your catalogs.</CardDescription>
              </div>
            </div>
            <Button onClick={() => router.push('/add-catalog')}>
                Add to a Catalog
            </Button>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-5 w-40" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><div className="flex items-center gap-2"><Skeleton className="h-10 w-10" /><Skeleton className="h-5 w-28" /></div></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><div className="flex gap-2 justify-end"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : kits.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><button className="flex items-center gap-1">Catalog <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead><button className="flex items-center gap-1">Kit Title <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kits.map((kit) => (
                  <TableRow key={kit.id}>
                    <TableCell className='text-muted-foreground'>
                        <div>{kit.catalogTitle}</div>
                        <div className='font-mono text-xs'>{kit.catalogCode}</div>
                    </TableCell>
                    <TableCell>
                        <div className='flex items-center gap-3'>
                            <Avatar className="h-10 w-10 rounded-md border">
                                <AvatarImage src={kit.featuredImage} alt={kit.nameOrTitle} />
                                <AvatarFallback className="rounded-md"><ImageIcon /></AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{kit.nameOrTitle}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className="capitalize">{kit.kitType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Edit Kit" onClick={() => handleEdit(kit.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete Kit" className="text-destructive hover:text-destructive" onClick={() => handleDelete(kit.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium">No Marketing Kits Found</h3>
              <p className="text-muted-foreground">Add kits to your catalogs to see them here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
