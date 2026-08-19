import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50/40 w-full">
      {/* Sidebar (handles desktop list and mobile sheet drawer) */}
      <Sidebar adminEmail={session.email} />

      {/* Content wrapper */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Desktop Navbar */}
        <Navbar />

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
