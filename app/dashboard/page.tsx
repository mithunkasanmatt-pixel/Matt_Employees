import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { prisma } from '@/lib/prisma';
import { Users, UserCheck, GraduationCap, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const revalidate = 0; // Disable static caching so numbers refresh immediately

export default async function DashboardPage() {
  // Fetch stats from PostgreSQL
  const totalEmployees = await prisma.employee.count();
  const totalStaff = await prisma.employee.count({
    where: { employeeType: 'EMPLOYEE' },
  });
  const totalInterns = await prisma.employee.count({
    where: { employeeType: 'INTERN' },
  });

  const recentlyAdded = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const stats = [
    {
      title: 'Total Force',
      value: totalEmployees,
      description: 'Active personnel registered',
      icon: Users,
      color: 'text-brand-brown bg-brand-brown/10 border-brand-brown/20',
    },
    {
      title: 'Full-Time Employees',
      value: totalStaff,
      description: 'Regular staff members',
      icon: UserCheck,
      color: 'text-brand-gold bg-brand-gold/10 border-brand-gold/20',
    },
    {
      title: 'Interns',
      value: totalInterns,
      description: 'Internship programs active',
      icon: GraduationCap,
      color: 'text-brand-brown bg-brand-gold/10 border-brand-gold/20',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time corporate metrics and recently onboarded personnel.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-semibold tracking-tight text-slate-500">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg border ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recently Added Section */}
        <Card className="border-slate-200/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recently Added Employees
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                The last 5 employee records added to the database.
              </p>
            </div>
            <Link
              href="/dashboard/employees"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View Directory
            </Link>
          </CardHeader>
          <CardContent>
            {recentlyAdded.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No employee records found. Click "Add Employee" in the sidebar to get started.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentlyAdded.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                        <AvatarImage src={employee.image || ''} alt={employee.name} />
                        <AvatarFallback className="bg-slate-100 font-semibold text-slate-600 text-xs">
                          {employee.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-950 truncate hover:underline">
                          <Link href={`/dashboard/employees/${employee.id}`}>{employee.name}</Link>
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-slate-900">{employee.role}</p>
                        <p className="text-[10px] text-muted-foreground">
                          ID: {employee.employeeId}
                        </p>
                      </div>
                      <Badge
                        variant={employee.employeeType === 'EMPLOYEE' ? 'default' : 'secondary'}
                        className="text-[10px] py-0.5 px-2 font-semibold"
                      >
                        {employee.employeeType === 'EMPLOYEE' ? 'Employee' : 'Intern'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
