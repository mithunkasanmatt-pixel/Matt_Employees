import { Suspense } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { prisma } from '@/lib/prisma';
import { EmployeeSearchFilters } from '@/components/employees/employee-search-filters';
import { EmployeeTable } from '@/components/employees/employee-table';
import { Loader2 } from 'lucide-react';

export const revalidate = 0; // Ensure data is dynamic and always up to date

interface PageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function EmployeesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || '';
  const type = params.type || '';
  const page = parseInt(params.page || '1', 10);
  const pageSize = 10;

  // Build prisma filter where clause
  const where: any = {};

  if (type === 'EMPLOYEE' || type === 'INTERN') {
    where.employeeType = type;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { employeeId: { contains: search, mode: 'insensitive' } },
      { mobileNo: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * pageSize;

  // Execute count and find queries in parallel
  const [employees, totalRecords] = await Promise.all([
    prisma.employee.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: pageSize,
    }),
    prisma.employee.count({ where }),
  ]);

  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const normalizedPage = Math.min(Math.max(1, page), totalPages);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, search, and download PDF sheets for Matt Engineering Solutions personnel.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <Suspense fallback={
          <div className="flex h-12 items-center justify-center border rounded-xl bg-background">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        }>
          <EmployeeSearchFilters />
        </Suspense>

        {/* Employee Grid/Table */}
        <Suspense fallback={
          <div className="flex h-64 items-center justify-center border rounded-xl bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <EmployeeTable
            employees={employees}
            currentPage={normalizedPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
          />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
