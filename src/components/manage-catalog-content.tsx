
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Catalog, Role } from '@/types';
import { getCatalogs } from '@/app/add-catalog/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowUpDown, Edit, Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import { Badge } from './ui/badge';
import { ADMIN_ROLES } from '@/lib/roles';


const CatalogCard = ({ catalog }: { catalog: Catalog }) => {
  const formatCurrency = (amount: number, currency: 'INR' | 'USD') => {
    return amount.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency,
    });
  };

  return (
    <Link href={`/manage-catalog/${catalog.id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        <div className="relative aspect-video">
          <Image
            src={catalog.featuredImage}
            alt={catalog.title}
            fill
            className="object-cover"
            data-ai-hint="product image"
          />
        </div>
        <CardHeader>
          <Badge variant="secondary" className="w-fit mb-2">{catalog.categoryName}</Badge>
          <CardTitle className="text-base font-bold line-clamp-2">{catalog.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{catalog.description}</p>
        </CardContent>
        <CardFooter>
          <p className="font-semibold">{formatCurrency(catalog.sellingPrice, catalog.pricingType)}</p>
        </CardFooter>
      </Card>
    </Link>
  );
};


export default function ManageCatalogContent({ role }: { role: Role }) {
  const [catalogs, setCatalogs] = React.useState<Catalog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchCatalogs = React.useCallback(async () => {
    setLoading(true);
    const data = await getCatalogs();
    setCatalogs(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  const handleEdit = (id: string) => {
    toast({ title: 'Info', description: `Edit functionality for catalog ${id} is not implemented yet.` });
  };

  const handleDelete = (id: string) => {
    toast({ title: 'Info', description: `Delete functionality for catalog ${id} is not implemented yet.` });
  };
  
  const formatCurrency = (amount: number, currency: 'INR' | 'USD') => {
    return amount.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency,
    });
  };

  const isAdminRole = ADMIN_ROLES.includes(role);

  if (loading) {
    return (
       <div className="space-y-6">
           <div className="flex justify-between items-center">
               <Skeleton className="h-10 w-64" />
               {isAdminRole && <Skeleton className="h-10 w-32" />}
           </div>
           <div className={`grid grid-cols-1 ${isAdminRole ? '' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
             {isAdminRole ? (
               <Skeleton className="h-[200px] w-full" />
             ) : (
               [...Array(4)].map((_, i) => (
                 <Skeleton key={i} className="h-80 w-full rounded-lg" />
               ))
             )}
           </div>
       </div>
   );
 }

  if (role === 'Partner') {
    return (
        <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Browse Catalogs</h1>
              <p className="text-muted-foreground">Explore all available catalogs.</p>
            </div>
            {catalogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {catalogs.map((catalog) => (
                        <CatalogCard key={catalog.id} catalog={catalog} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium">No Catalogs Available</h3>
                    <p className="text-muted-foreground">There are currently no catalogs to display.</p>
                </div>
            )}
        </div>
    );
  }

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
                  <CardTitle>Manage Catalogs</CardTitle>
                  <CardDescription>View, edit, or delete existing catalogs.</CardDescription>
                </div>
            </div>
            <Button onClick={() => router.push('/add-catalog')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Catalog
            </Button>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
             {catalogs.length > 0 ? (
                 <Table>
                     <TableHeader>
                         <TableRow>
                             <TableHead><button className="flex items-center gap-1">Title <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                             <TableHead><button className="flex items-center gap-1">Category <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                             <TableHead><button className="flex items-center gap-1">Code <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                             <TableHead><button className="flex items-center gap-1">Price <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                             <TableHead className="text-right">Actions</TableHead>
                         </TableRow>
                     </TableHeader>
                     <TableBody>
                         {catalogs.map((catalog) => (
                             <TableRow key={catalog.id}>
                                 <TableCell className='font-medium'>{catalog.title}</TableCell>
                                 <TableCell className='text-muted-foreground'>{catalog.categoryName}</TableCell>
                                 <TableCell className='text-muted-foreground font-mono text-xs'>{catalog.catalogCode}</TableCell>
                                 <TableCell>{formatCurrency(catalog.sellingPrice, catalog.pricingType)}</TableCell>
                                 <TableCell className="text-right">
                                     <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" title="Edit Catalog" onClick={() => handleEdit(catalog.id)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Delete Catalog" className="text-destructive hover:text-destructive" onClick={() => handleDelete(catalog.id)}>
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
                    <h3 className="text-lg font-medium">No Catalogs Found</h3>
                    <p className="text-muted-foreground">Get started by adding a new catalog.</p>
                </div>
             )}
          </CardContent>
      </Card>
    </div>
  );
}
