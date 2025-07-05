'use client';

import * as React from 'react';
import type { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, KeyRound, Plus, Search, Trash2, ArrowUpDown } from 'lucide-react';
import ProfileEditDialog from './profile-edit-dialog';
import SecurityUpdateDialog from './security-update-dialog';
import AddUserDialog from './add-user-dialog';
import { getUsers } from '@/app/login/actions';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileContentProps {
  currentUser: User;
}

export default function ProfileContent({ currentUser }: ProfileContentProps) {
  const [teamMembers, setTeamMembers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const allUsers = await getUsers();
      setTeamMembers(allUsers.filter(u => u.id !== currentUser.id));
      setLoading(false);
    };
    fetchUsers();
  }, [currentUser.id]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} data-ai-hint="person" />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{currentUser.name}</h2>
              <p className="text-muted-foreground">{currentUser.role}</p>
            </div>
          </div>
          <ProfileEditDialog currentUser={currentUser}>
            <Button variant="outline" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </ProfileEditDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg">Security Update</CardTitle>
          <SecurityUpdateDialog>
            <Button variant="ghost" size="icon">
              <KeyRound className="h-5 w-5 text-muted-foreground" />
            </Button>
          </SecurityUpdateDialog>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            <div className="flex items-center justify-between py-4">
              <label className="font-medium text-sm">Password</label>
              <span className="text-muted-foreground">************</span>
            </div>
            <div className="flex items-center justify-between py-4">
              <label className="font-medium text-sm">Addon Key</label>
              <span className="text-sm">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Manage Access</CardTitle>
          <AddUserDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </AddUserDialog>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Select defaultValue="10">
                <SelectTrigger className="w-auto">
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
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-10" />
            </div>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button className="flex items-center gap-2">Full Name <ArrowUpDown className="h-4 w-4" /></button>
                  </TableHead>
                  <TableHead>
                    <button className="flex items-center gap-2">Phone Number <ArrowUpDown className="h-4 w-4" /></button>
                  </TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  teamMembers.slice(0, 4).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>+91 9988776655</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell className="flex gap-1">
                        <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div>Showing 1 to {teamMembers.slice(0, 4).length} of {teamMembers.length} entries</div>
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
