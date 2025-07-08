'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { seedUsers } from './actions';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSeeding, setIsSeeding] = React.useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        toast({ title: 'Login Successful', description: 'Welcome back!' });
        router.push('/');
      } else {
        toast({
          title: 'Login Failed',
          description: result.error || 'Please check your credentials.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'An Error Occurred',
        description: 'Could not process your login request.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedUsers();
      if (result.success) {
        toast({
          title: 'Database Seeded',
          description: result.message,
        });
      } else {
        toast({
          title: 'Seeding Failed',
          description: result.error || 'Could not seed the database.',
          variant: 'destructive',
        });
      }
    } catch (error) {
       toast({
        title: 'Seeding Error',
        description: (error as Error).message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSeeding(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center mb-4">
            <Image src="/logo-name.png" alt="EstateFlow" width={180} height={40} />
          </div>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@estateflow.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
             <Button variant="outline" onClick={handleSeed} disabled={isSeeding} className="w-full">
                <Database className="mr-2 h-4 w-4" />
                {isSeeding ? 'Seeding...' : 'Seed Database'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Adds initial users to Firestore if they don't exist.</p>
          </div>
           <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">Don&apos;t have an account?</p>
            <div className="flex items-center justify-center gap-x-6 mt-2">
                <Link href="/seller-signup" className="font-medium text-primary hover:underline">
                Register as Seller
                </Link>
                <div className="h-4 w-px bg-border"></div>
                <Link href="/signup" className="font-medium text-primary hover:underline">
                Register as Partner
                </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
