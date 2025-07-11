
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
import { ArrowUpDown, Edit, Trash2, PlusCircle, ArrowLeft, Search } from 'lucide-react';
import { Badge } from './ui/badge';
import { ADMIN_ROLES } from '@/lib/roles';
import { Input } from './ui/input';
import { useAuth } from '@/hooks/useAuth';


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
  const [searchTerm, setSearchTerm] = React.useState('');
  const { user: currentUser } = useAuth();

  const fetchCatalogs = React.useCallback(async () => {
    setLoading(true);
    const sellerId = currentUser?.role === 'Seller' ? currentUser.id : undefined;
    const data = await getCatalogs(sellerId);
    setCatalogs(data);
    setLoading(false);
  }, [currentUser]);

  React.useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  const filteredCatalogs = React.useMemo(() => {
    return catalogs.filter(catalog =>
        catalog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catalog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catalog.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        catalog.catalogCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [catalogs, searchTerm]);

  const handleEdit = (id: string) => {
    router.push(`/edit-catalog/${id}`);
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

  const isAdminOrSeller = ADMIN_ROLES.includes(role) || role === 'Seller';

  if (loading) {
    return (
       <div className="space-y-6">
           <div className="flex justify-between items-center">
               <Skeleton className="h-10 w-64" />
               <Skeleton className="h-10 w-32" />
           </div>
           <div className={`grid grid-cols-1 ${isAdminOrSeller ? '' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-6`}>
             {isAdminOrSeller ? (
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Browse Catalogs</h1>
                <p className="text-muted-foreground">Explore all available catalogs.</p>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search catalogs..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {filteredCatalogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCatalogs.map((catalog) => (
                        <CatalogCard key={catalog.id} catalog={catalog} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-lg font-medium">No Catalogs Found</h3>
                    <p className="text-muted-foreground">Your search for "{searchTerm}" did not match any catalogs.</p>
                </div>
            )}
        </div>
    );
  }

  // Admin or Seller View
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
        <div className="p-4 border-t">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search catalogs..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <CardContent className='p-0'>
             {filteredCatalogs.length > 0 ? (
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
                         {filteredCatalogs.map((catalog) => (
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
                    <p className="text-muted-foreground">Your search for "{searchTerm}" did not match any catalogs.</p>
                </div>
             )}
          </CardContent>
      </Card>
    </div>
  );
}
