'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Edit, Trash2, FileText, ChevronLeft, ChevronRight, Download, Image as ImageIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeDeleteDialog } from './employee-delete-dialog';

interface Employee {
  id: string;
  name: string;
  email: string;
  mobileNo: string;
  employeeId: string;
  image: string | null;
  role: string;
  joiningDate: Date | string;
  employeeType: 'EMPLOYEE' | 'INTERN';
}

interface EmployeeTableProps {
  employees: Employee[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
}

export function EmployeeTable({
  employees,
  currentPage,
  totalPages,
  totalRecords,
}: EmployeeTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/dashboard/employees?${params.toString()}`);
  };
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleOpenDeleteDialog = (employee: Employee) => {
    setDeleteTarget(employee);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block border border-slate-200/80 rounded-xl bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/70">
            <TableRow>
              <TableHead className="w-[80px]">Photo</TableHead>
              <TableHead className="font-semibold text-slate-800">Name</TableHead>
              <TableHead className="font-semibold text-slate-800">Employee ID</TableHead>
              <TableHead className="font-semibold text-slate-800">Role</TableHead>
              <TableHead className="font-semibold text-slate-800">Type</TableHead>
              <TableHead className="font-semibold text-slate-800">Contact</TableHead>
              <TableHead className="font-semibold text-slate-800">Joining Date</TableHead>
              <TableHead className="text-right font-semibold text-slate-800 pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  No employee records found.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-slate-50/40 transition-colors">
                  <TableCell className="pl-6">
                    <Avatar className="h-9 w-9 border border-slate-100 shadow-sm">
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
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    <Link
                      href={`/dashboard/employees/${employee.id}`}
                      className="hover:underline hover:text-primary transition-colors"
                    >
                      {employee.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{employee.employeeId}</TableCell>
                  <TableCell className="text-slate-600">{employee.role}</TableCell>
                  <TableCell>
                    <Badge variant={employee.employeeType === 'EMPLOYEE' ? 'default' : 'secondary'} className="text-[10px] font-semibold py-0.5 px-2">
                      {employee.employeeType === 'EMPLOYEE' ? 'Employee' : 'Intern'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 space-y-0.5">
                    <div className="truncate max-w-[150px]">{employee.email}</div>
                    <div className="font-medium">{employee.mobileNo}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {new Date(employee.joiningDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/dashboard/employees/${employee.id}`}
                        className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8 text-slate-500 hover:text-slate-800' })}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/employees/${employee.id}/edit`}
                        className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8 text-slate-500 hover:text-slate-800' })}
                        title="Edit Employee"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      {employee.image ? (
                        <a
                          href={employee.image}
                          download={`employee-${employee.employeeId}-photo.png`}
                          className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8 text-slate-500 hover:text-brand-gold' })}
                          title="Download Photo"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </a>
                      ) : (
                        <button
                          disabled
                          className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8 text-slate-300 cursor-not-allowed' })}
                          title="No Photo Available"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>
                      )}
                      <a
                        href={`/api/employees/${employee.id}/pdf`}
                        download
                        className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'h-8 w-8 text-slate-500 hover:text-brand-brown' })}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleOpenDeleteDialog(employee)}
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="md:hidden space-y-3">
        {employees.length === 0 ? (
          <div className="text-center py-12 bg-background border border-slate-200/80 rounded-xl text-muted-foreground text-sm">
            No employee records found.
          </div>
        ) : (
          employees.map((employee) => (
            <Card key={employee.id} className="border-slate-200/80 shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-slate-100 shadow-sm">
                    <AvatarImage src={employee.image || ''} alt={employee.name} />
                    <AvatarFallback className="bg-slate-100 font-semibold text-slate-600 text-sm">
                      {employee.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/employees/${employee.id}`}
                      className="font-bold text-slate-900 truncate block hover:underline"
                    >
                      {employee.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-slate-500">{employee.employeeId}</span>
                      <Badge variant={employee.employeeType === 'EMPLOYEE' ? 'default' : 'secondary'} className="text-[9px] py-0 px-1.5 font-semibold leading-tight">
                        {employee.employeeType === 'EMPLOYEE' ? 'Employee' : 'Intern'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-y py-2.5 my-2.5 text-xs border-slate-100">
                  <div>
                    <p className="text-muted-foreground">Designation</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{employee.role}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Joining Date</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {new Date(employee.joiningDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-semibold text-slate-850 mt-0.5 break-all">{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mobile</p>
                    <p className="font-semibold text-slate-850 mt-0.5">{employee.mobileNo}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1.5">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/employees/${employee.id}`}
                      className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-8 text-xs' })}
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View
                    </Link>
                    <Link
                      href={`/dashboard/employees/${employee.id}/edit`}
                      className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-8 text-xs' })}
                    >
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </div>
                  <div className="flex items-center gap-1">
                    {employee.image && (
                      <a
                        href={employee.image}
                        download={`employee-${employee.employeeId}-photo.png`}
                        className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-8 text-xs text-brand-gold border-brand-gold/20 hover:bg-brand-gold/10 font-semibold' })}
                      >
                        <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                        Photo
                      </a>
                    )}
                    <a
                      href={`/api/employees/${employee.id}/pdf`}
                      download
                      className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-8 text-xs text-brand-brown border-brand-brown/20 hover:bg-brand-brown/10 font-semibold' })}
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      PDF
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive"
                      onClick={() => handleOpenDeleteDialog(employee)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4 bg-background border border-slate-200/80 rounded-xl shadow-sm">
          <div className="text-xs text-slate-500 font-medium pl-2">
            Showing Page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800">{totalPages}</span> ({totalRecords} records)
          </div>
          <div className="flex items-center gap-1.5 pr-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  className="h-8 w-8 text-xs font-semibold"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Strict Double-Verification Delete Modal */}
      <EmployeeDeleteDialog
        employee={deleteTarget}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </div>
  );
}
