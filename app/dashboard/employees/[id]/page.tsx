import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { prisma } from '@/lib/prisma';
import { EmployeeDetailsActions } from '@/components/employees/employee-details-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Mail, Phone, ShieldAlert, Award, CalendarDays, Clock, RefreshCw } from 'lucide-react';

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { id } = await params;

  // Fetch employee record from database
  const employee = await prisma.employee.findUnique({
    where: { id },
  });

  if (!employee) {
    notFound();
  }

  // Format Dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation & Action Header */}
        <EmployeeDetailsActions employee={employee} />

        {/* Profile Card */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Photo Card (Left Column) */}
          <Card className="border-slate-200/80 shadow-sm md:col-span-1">
            <CardContent className="pt-8 pb-6 flex flex-col items-center justify-center text-center">
              <Avatar className="h-28 w-28 border-2 border-slate-100 shadow-md mb-4">
                <AvatarImage src={employee.image || ''} alt={employee.name} />
                <AvatarFallback className="bg-slate-100 font-bold text-slate-600 text-2xl">
                  {employee.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold text-slate-900">{employee.name}</h2>
              <p className="text-xs font-semibold text-slate-500 tracking-mono mt-0.5">{employee.employeeId}</p>

              <Badge
                variant={employee.employeeType === 'EMPLOYEE' ? 'default' : 'secondary'}
                className="mt-3 text-xs font-semibold py-0.5 px-3"
              >
                {employee.employeeType === 'EMPLOYEE' ? 'Employee' : 'Intern'}
              </Badge>

              <div className="w-full mt-6 pt-4 border-t border-slate-100 text-left space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate" title={employee.email}>{employee.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{employee.mobileNo}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Card (Right Column) */}
          <Card className="border-slate-200/80 shadow-sm md:col-span-2">
            <CardHeader className="border-b border-slate-100/70 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="text-xs font-bold text-slate-500 col-span-1">Designation</span>
                  <span className="text-sm font-semibold text-slate-800 col-span-2">{employee.role}</span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="text-xs font-bold text-slate-500 col-span-1">Joining Date</span>
                  <span className="text-sm font-medium text-slate-800 col-span-2 flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    {formatDate(employee.joiningDate)}
                  </span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="text-xs font-bold text-slate-500 col-span-1">Employee Type</span>
                  <span className="text-sm font-medium text-slate-800 col-span-2">
                    {employee.employeeType === 'EMPLOYEE' ? 'Regular Staff (Full-time)' : 'Internship (Temporary)'}
                  </span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="text-xs font-bold text-slate-500 col-span-1">Record Onboarded</span>
                  <span className="text-xs font-medium text-slate-500 col-span-2 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {formatTimestamp(employee.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="text-xs font-bold text-slate-500 col-span-1">Last Modified</span>
                  <span className="text-xs font-medium text-slate-500 col-span-2 flex items-center gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                    {formatTimestamp(employee.updatedAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
