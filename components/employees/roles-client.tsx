'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Trash2, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createRole, deleteRole } from '@/app/actions/role-actions';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  createdAt: Date | string;
}

interface RolesClientProps {
  roles: Role[];
}

export function RolesClient({ roles }: RolesClientProps) {
  const router = useRouter();
  const [roleName, setRoleName] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error('Role name cannot be empty.');
      return;
    }

    startTransition(async () => {
      const result = await createRole({ name: roleName });
      if (result.success) {
        toast.success('Role added successfully');
        setRoleName('');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to add role');
      }
    });
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role? This will not affect existing employees with this designation, but the role will be removed from the dropdown options.')) {
      return;
    }

    setLoadingId(id);
    try {
      const result = await deleteRole(id);
      if (result.success) {
        toast.success('Role deleted successfully');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete role');
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Add Role Form (Left Column) */}
      <Card className="border-slate-200/80 shadow-sm md:col-span-1 h-fit">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Plus className="h-4 w-4 text-brand-gold" />
            Add New Designation
          </CardTitle>
          <CardDescription className="text-xs">
            Create a new role title to appear in the employee onboarding form.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAddRole}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="roleName">Role Name *</Label>
              <Input
                id="roleName"
                placeholder="e.g. Lead Designer"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full font-semibold" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Designation'
              )}
            </Button>
          </CardContent>
        </form>
      </Card>

      {/* Roles List Table (Right Column) */}
      <Card className="border-slate-200/80 shadow-sm md:col-span-2">
        <CardHeader className="border-b border-slate-100/70 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Award className="h-4 w-4 text-brand-brown" />
            Active Designations
          </CardTitle>
          <CardDescription className="text-xs">
            List of all available designations within the employee management portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {roles.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground bg-background">
              No designations added yet. Use the form on the left to add one.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-800 pl-6">Role Name</TableHead>
                    <TableHead className="font-semibold text-slate-800">Date Created</TableHead>
                    <TableHead className="text-right font-semibold text-slate-800 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id} className="hover:bg-slate-50/40 transition-colors">
                      <TableCell className="font-medium text-slate-900 pl-6">{role.name}</TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(role.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10"
                          title="Delete Role"
                          onClick={() => handleDeleteRole(role.id)}
                          disabled={loadingId === role.id}
                        >
                          {loadingId === role.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
