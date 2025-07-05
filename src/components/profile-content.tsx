
'use client';

import * as React from 'react';
import type { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pencil, KeyRound } from 'lucide-react';
import ProfileEditDialog from './profile-edit-dialog';
import SecurityUpdateDialog from './security-update-dialog';

interface ProfileContentProps {
  currentUser: User;
}

export default function ProfileContent({ currentUser }: ProfileContentProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
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
          <SecurityUpdateDialog currentUser={currentUser}>
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
    </div>
  );
}
