import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { EmployeeForm } from '@/components/employees/employee-form';
import { prisma } from '@/lib/prisma';

interface EditEmployeePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const { id } = await params;

  // Fetch current employee details and roles list
  const [employee, roles] = await Promise.all([
    prisma.employee.findUnique({
      where: { id },
    }),
    prisma.role.findMany({
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  if (!employee) {
    notFound();
  }

  // Convert Date types to plain serializable string/ISO formats for Client Component hydration
  const serializableEmployee = {
    ...employee,
    joiningDate: employee.joiningDate.toISOString(),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update employee details for <strong>{employee.name}</strong>. Changes take effect immediately.
          </p>
        </div>
        <EmployeeForm employee={serializableEmployee} isEditMode={true} roles={roles} />
      </div>
    </DashboardLayout>
  );
}
