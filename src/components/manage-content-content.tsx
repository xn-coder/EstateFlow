
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { ContentItem, Category } from '@/types';
import { getContent, deleteContent } from '@/app/manage-content/actions';
import { getCategories } from '@/app/manage-category/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowUpDown, Edit, Trash2, PlusCircle, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import AddContentDialog from './add-content-dialog';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';

export default function ManageContentContent() {
  const [content, setContent] = React.useState<ContentItem[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const sellerId = currentUser?.role === 'Seller' ? currentUser.id : undefined;
    const [contentData, categoryData] = await Promise.all([
      getContent(sellerId),
      getCategories(sellerId),
    ]);
    setContent(contentData);
    setCategories(categoryData);
    setLoading(false);
  }, [currentUser]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (id: string) => {
    toast({ title: 'Info', description: `Edit functionality for content ${id} is not implemented yet.` });
  };

  const handleDelete = async (id: string) => {
    const result = await deleteContent(id);
    if (result.success) {
      toast({ title: 'Success', description: 'Content deleted successfully.' });
      fetchData();
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
                <CardTitle>Manage Content</CardTitle>
                <CardDescription>Add, edit, or delete content pieces.</CardDescription>
              </div>
            </div>
            <AddContentDialog categories={categories} onContentAdded={fetchData}>
              <Button disabled={loading || categories.length === 0}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Content
              </Button>
            </AddContentDialog>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          {loading ? (
            <Table>
              <TableHeader><TableRow><TableHead><Skeleton className="h-5 w-40" /></TableHead><TableHead><Skeleton className="h-5 w-32" /></TableHead><TableHead><Skeleton className="h-5 w-24" /></TableHead><TableHead><Skeleton className="h-5 w-24" /></TableHead></TableRow></TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="flex items-center gap-2"><Skeleton className="h-10 w-10" /><Skeleton className="h-5 w-28" /></div></TableCell>
                    <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><div className="flex gap-2 justify-end"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : content.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><button className="flex items-center gap-1">Title <ArrowUpDown className="h-3 w-3" /></button></TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className="h-10 w-10 rounded-md border">
                          <AvatarImage src={item.featuredImage} alt={item.title} />
                          <AvatarFallback className="rounded-md"><ImageIcon /></AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{item.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>{item.categoryName}</TableCell>
                    <TableCell><Badge variant="outline">{item.contentType}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Edit Content" onClick={() => handleEdit(item.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Delete Content" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the content piece "{item.title}".</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction></AlertDialogFooter>
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
              <h3 className="text-lg font-medium">No Content Found</h3>
              <p className="text-muted-foreground">Get started by adding new content.</p>
              {categories.length === 0 && <p className="text-sm text-destructive mt-2">You must add a category before you can add content.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
