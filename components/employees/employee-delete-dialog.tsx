'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteEmployee } from '@/app/actions/employee-actions';
import { toast } from 'sonner';

interface EmployeeDeleteDialogProps {
  employee: {
    id: string;
    name: string;
    email: string;
    employeeId: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeDeleteDialog({ employee, open, onOpenChange }: EmployeeDeleteDialogProps) {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState('');
  const [idInput, setIdInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!employee) return null;

  const matchesEmail = emailInput.trim().toLowerCase() === employee.email.trim().toLowerCase();
  const matchesId = idInput.trim() === employee.employeeId.trim();
  const isFormValid = matchesEmail && matchesId;

  const handleDelete = async () => {
    if (!isFormValid) return;
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const result = await deleteEmployee(employee.id, {
        email: emailInput,
        employeeId: idInput,
      });

      if (result.success) {
        toast.success(`Deleted employee record for ${employee.name}`);
        onOpenChange(false);
        setEmailInput('');
        setIdInput('');
        router.refresh(); // Refresh page to reload employee list
      } else {
        setErrorMsg(result.error || 'Failed to delete employee');
        toast.error(result.error || 'Failed to delete employee');
      }
    } catch (err: any) {
      setErrorMsg('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isDeleting) {
          onOpenChange(val);
          if (!val) {
            setEmailInput('');
            setIdInput('');
            setErrorMsg(null);
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Critical Action Required</DialogTitle>
          </div>
          <DialogDescription className="text-slate-500">
            Are you sure you want to delete <strong>{employee.name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/20 text-xs text-destructive font-medium space-y-1">
          <p>This action requires dual verification. To proceed, you must type the selected employee's credentials exactly:</p>
          <p className="font-semibold mt-1">Target Email: <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-destructive/10">{employee.email}</span></p>
          <p className="font-semibold">Target Employee ID: <span className="font-mono bg-background px-1.5 py-0.5 rounded border border-destructive/10">{employee.employeeId}</span></p>
        </div>

        <div className="space-y-4 py-2">
          {errorMsg && (
            <p className="text-xs font-semibold text-destructive">{errorMsg}</p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="confirm-email" className="text-xs">Confirm Employee Email</Label>
            <Input
              id="confirm-email"
              type="email"
              placeholder={employee.email}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              disabled={isDeleting}
              className={emailInput && !matchesEmail ? 'border-destructive focus-visible:ring-destructive' : ''}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-id" className="text-xs">Confirm Employee ID</Label>
            <Input
              id="confirm-id"
              type="text"
              placeholder={employee.employeeId}
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              disabled={isDeleting}
              className={idInput && !matchesId ? 'border-destructive focus-visible:ring-destructive' : ''}
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isFormValid || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Confirm Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
