'use client';

import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard Overview';
    if (pathname === '/dashboard/employees') return 'Employee Directory';
    if (pathname === '/dashboard/employees/new') return 'Add New Employee';
    if (pathname.endsWith('/edit')) return 'Edit Employee Profile';
    if (pathname.match(/^\/dashboard\/employees\/[a-f0-9-]+$/i)) return 'Employee Details';
    return 'Matt Engineering Portal';
  };

  return (
    <header className="hidden md:flex items-center justify-between px-8 h-16 border-b bg-background w-full shrink-0">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground uppercase">{getPageTitle()}</h2>
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
        <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>
    </header>
  );
}
