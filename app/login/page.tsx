'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginAdmin } from '@/app/actions/auth-actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setServerError(null);

    try {
      const result = await loginAdmin(data);

      if (result.success) {
        toast.success('Login successful! Redirecting...');
        router.push('/dashboard');
        router.refresh();
      } else {
        setServerError(result.error || 'Invalid credentials');
        toast.error(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setServerError('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-stone-50 via-white to-brand-gold/10 px-4 dark:from-stone-950 dark:via-stone-950/90 dark:to-brand-gold/5">
      <Card className="w-full max-w-md border-border glass glow-primary relative">
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center mb-2 rounded-2xl bg-card p-1.5 shadow-md border border-brand-gold/15 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Matt Engineering Solutions
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Employee Management Admin Portal
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pb-8">
            {serverError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{serverError}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mattengg.com"
                  className={cn("pl-9", errors.email ? 'border-destructive focus-visible:ring-destructive' : '')}
                  disabled={loading}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className={cn(
                    "pl-9 pr-10",
                    errors.password ? 'border-destructive focus-visible:ring-destructive' : ''
                  )}
                  disabled={loading}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Quick Access Info for Testing */}
            {/* <div className="mt-6 border-t border-border pt-4 text-center">
              <p className="text-[11px] text-muted-foreground">Admin Credentials:</p>
              <div className="mt-2 text-[10px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40">
                <div>
                  <span className="font-semibold block text-foreground">Admin Portal</span>
                  admin@mattengg.com<br />Matt@4321admin
                </div>
              </div>
            </div> */}
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
