
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/types';
import { getCategories, deleteCategory } from '@/app/manage-category/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowUpDown, Edit, Trash2, PlusCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import AddCategoryDialog from './add-category-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

export default function ManageCategoryContent() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (id: string) => {
    toast({ title: 'Info', description: `Edit functionality for category ${id} is not implemented yet.` });
  };

  const handleDelete = async (id: string) => {
    const result = await deleteCategory(id);
    if (result.success) {
      toast({ title: 'Success', description: 'Category deleted successfully.' });
      fetchCategories();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
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
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>Add, edit, or delete categories for your content.</CardDescription>
              </div>
            </div>
            <AddCategoryDialog onCategoryAdded={fetchCategories}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </AddCategoryDialog>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="flex items-center gap-2"><Skeleton className="h-10 w-10" /><Skeleton className="h-5 w-28" /></div></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><div className="flex gap-2 justify-end"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><button className="flex items-center gap-1">Category Name <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className="h-10 w-10 rounded-md border">
                          <AvatarImage src={category.imageUrl} alt={category.name} />
                          <AvatarFallback className="rounded-md"><ImageIcon /></AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className='text-muted-foreground underline'>
                        <a href={category.url} target="_blank" rel="noopener noreferrer">{category.url}</a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Edit Category" onClick={() => handleEdit(category.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Delete Category" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the category "{category.name}".</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(category.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-lg font-medium">No Categories Found</h3>
              <p className="text-muted-foreground">Get started by adding a new category.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
