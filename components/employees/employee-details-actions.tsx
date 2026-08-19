'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { EmployeeDeleteDialog } from './employee-delete-dialog';

interface EmployeeDetailsActionsProps {
  employee: {
    id: string;
    name: string;
    email: string;
    employeeId: string;
    image?: string | null;
  };
}

export function EmployeeDetailsActions({ employee }: EmployeeDetailsActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
      <div>
        <Link
          href="/dashboard/employees"
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'text-slate-500 hover:text-slate-800 -ml-2' })}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Directory
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/dashboard/employees/${employee.id}/edit`}
          className={buttonVariants({ variant: 'outline', size: 'sm', className: 'font-semibold' })}
        >
          <Edit className="mr-1.5 h-4 w-4" />
          Edit Profile
        </Link>

        {employee.image ? (
          <a
            href={employee.image}
            download={`employee-${employee.employeeId}-photo.png`}
            className={buttonVariants({ variant: 'outline', size: 'sm', className: 'font-semibold text-brand-gold border-brand-gold/20 hover:bg-brand-gold/10' })}
          >
            <ImageIcon className="mr-1.5 h-4 w-4" />
            Download Photo
          </a>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="font-semibold text-slate-400 border-slate-100 cursor-not-allowed"
          >
            <ImageIcon className="mr-1.5 h-4 w-4" />
            No Photo
          </Button>
        )}

        <a
          href={`/api/employees/${employee.id}/pdf`}
          download
          className={buttonVariants({ variant: 'outline', size: 'sm', className: 'font-semibold text-brand-brown border-brand-brown/20 hover:bg-brand-brown/10' })}
        >
          <Download className="mr-1.5 h-4 w-4" />
          Download PDF
        </a>

        <Button
          variant="destructive"
          size="sm"
          className="font-semibold"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-1.5 h-4 w-4" />
          Delete Employee
        </Button>
      </div>

      {/* Security Deletion Modal */}
      <EmployeeDeleteDialog
        employee={employee}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
}
export default EmployeeDetailsActions;
