import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RolesClient } from '@/components/employees/roles-client';
import { prisma } from '@/lib/prisma';

export const revalidate = 0; // Disable static caching so roles list updates instantly

export default async function RolesPage() {
  // Fetch existing roles from PostgreSQL
  const roles = await prisma.role.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Designations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Register and manage active designations and corporate roles for Matt Engineering Solutions.
          </p>
        </div>

        <RolesClient roles={roles} />
      </div>
    </DashboardLayout>
  );
}
