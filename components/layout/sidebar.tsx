'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, UserPlus, LogOut, Menu, ShieldAlert, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { logoutAdmin } from '@/app/actions/auth-actions';
import { useState } from 'react';
import { toast } from 'sonner';

interface SidebarProps {
  className?: string;
  adminEmail?: string;
}

export function Sidebar({ className, adminEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/dashboard/employees', icon: Users },
    { name: 'Add Employee', href: '/dashboard/employees/new', icon: UserPlus },
    { name: 'Roles', href: '/dashboard/roles', icon: Award },
  ];

  const handleLogout = async () => {
    try {
      const res = await logoutAdmin();
      if (res.success) {
        toast.success('Logged out successfully');
        router.push('/login');
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-2 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10 mt-4 transition-colors"
        onClick={() => {
          if (onClick) onClick();
          handleLogout();
        }}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </nav>
  );

  return (
    <>
      {/* Mobile Drawer Trigger */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-background w-full">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-5 w-5 object-contain" />
          <span className="font-bold text-sm tracking-tight">MES Portal</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger render={<Button variant="outline" size="icon" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="p-6 border-b">
                <SheetTitle className="font-bold text-lg text-primary flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="h-5 w-5 object-contain" />
                  Matt Engg Solutions
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-1">
                  Employee Admin Console
                </SheetDescription>
              </div>
              <NavLinks onClick={() => setIsOpen(false)} />
            </div>
            {adminEmail && (
              <div className="p-4 border-t bg-muted/30">
                <p className="text-xs text-muted-foreground truncate" title={adminEmail}>
                  Logged in as:
                </p>
                <p className="text-xs font-semibold truncate" title={adminEmail}>
                  {adminEmail}
                </p>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn('hidden md:flex flex-col w-[260px] border-r bg-background h-screen justify-between shrink-0', className)}>
        <div className="flex flex-col gap-2">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 flex items-center justify-center rounded-lg overflow-hidden bg-white p-1 shadow-sm border border-brand-gold/20">
                <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight leading-tight text-primary">Matt Engineering</h1>
                <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mt-0.5">Solutions</p>
              </div>
            </div>
          </div>
          <NavLinks />
        </div>
        {adminEmail && (
          <div className="p-4 border-t bg-muted/20">
            <p className="text-xs text-muted-foreground">Signed in admin:</p>
            <p className="text-xs font-semibold truncate mt-0.5" title={adminEmail}>
              {adminEmail}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
