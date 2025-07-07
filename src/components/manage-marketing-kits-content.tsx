
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { MarketingKitInfo, Role } from '@/types';
import { getMarketingKits } from '@/app/add-catalog/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowUpDown, Edit, Trash2, Image as ImageIcon, Download, ArrowLeft, PlusCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AddMarketingKitDialog from './add-marketing-kit-dialog';
import { ADMIN_ROLES } from '@/lib/roles';
import { useAuth } from '@/hooks/useAuth';

const MarketingKitCard = ({ kit }: { kit: MarketingKitInfo }) => {
  return (
    <Card className="overflow-hidden flex flex-col group">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={kit.featuredImage}
            alt={kit.nameOrTitle}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="marketing poster"
          />
          <Badge className="absolute top-2 right-2 capitalize">{kit.kitType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-base font-semibold line-clamp-2">{kit.nameOrTitle}</CardTitle>
        <CardDescription className="text-xs line-clamp-1 mt-1">{kit.catalogTitle} ({kit.catalogCode})</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <a href={kit.uploadedFile} download target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};


export default function ManageMarketingKitsContent({ role }: { role: Role }) {
  const [kits, setKits] = React.useState<MarketingKitInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const fetchKits = React.useCallback(async () => {
    setLoading(true);
    const sellerId = currentUser?.role === 'Seller' ? currentUser.id : undefined;
    const data = await getMarketingKits(sellerId);
    setKits(data);
    setLoading(false);
  }, [currentUser]);

  React.useEffect(() => {
    fetchKits();
  }, [fetchKits]);

  const handleEdit = (id: string) => {
    toast({ title: 'Info', description: `Edit functionality for kit ${id} is not implemented yet.` });
  };

  const handleDelete = (id: string) => {
    toast({ title: 'Info', description: `Delete functionality for kit ${id} is not implemented yet.` });
  };

  const isAdminOrSeller = ADMIN_ROLES.includes(role) || role === 'Seller';

  if (loading) {
    return (
       <div className="space-y-6">
           <Skeleton className="h-10 w-64" />
           <div className={`grid grid-cols-1 ${isAdminOrSeller ? '' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
             {isAdminOrSeller ? (
               <Skeleton className="h-[200px] w-full" />
             ) : (
               [...Array(8)].map((_, i) => (
                 <Skeleton key={i} className="h-72 w-full rounded-lg" />
               ))
             )}
           </div>
       </div>
   );
 }

  if (isAdminOrSeller) {
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
                <AddMarketingKitDialog onKitAdded={fetchKits}>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Kit</Button>
                </AddMarketingKitDialog>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {kits.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><button className="flex items-center gap-1">Kit Title <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                    <TableHead><button className="flex items-center gap-1">Catalog <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kits.map((kit) => (
                    <TableRow key={kit.id}>
                      <TableCell>
                          <div className='flex items-center gap-3'>
                              <Avatar className="h-10 w-10 rounded-md border">
                                  <AvatarImage src={kit.featuredImage} alt={kit.nameOrTitle} />
                                  <AvatarFallback className="rounded-md"><ImageIcon /></AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{kit.nameOrTitle}</span>
                          </div>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                          <div>{kit.catalogTitle}</div>
                          <div className='font-mono text-xs'>{kit.catalogCode}</div>
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

  // Partner View
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Marketing Kits</CardTitle>
                <CardDescription>Browse and download marketing materials.</CardDescription>
            </CardHeader>
            <CardContent>
                {kits.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {kits.map((kit) => (
                        <MarketingKitCard key={kit.id} kit={kit} />
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium">No Marketing Kits Found</h3>
                    <p className="text-muted-foreground">There are currently no marketing materials available.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  )
}
