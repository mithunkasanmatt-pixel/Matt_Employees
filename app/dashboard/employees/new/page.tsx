import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { EmployeeForm } from '@/components/employees/employee-form';
import { prisma } from '@/lib/prisma';

export default async function NewEmployeePage() {
  const roles = await prisma.role.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Onboard Personnel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete the form below to register a new employee or intern at Matt Engineering Solutions.
          </p>
        </div>
        <EmployeeForm roles={roles} />
      </div>
    </DashboardLayout>
  );
}
