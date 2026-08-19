'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, X, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { employeeSchema, type EmployeeInput } from '@/lib/validations/employee';
import { createEmployee, updateEmployee } from '@/app/actions/employee-actions';
import { toast } from 'sonner';

interface RoleOption {
  id: string;
  name: string;
}

interface EmployeeFormProps {
  employee?: {
    id: string;
    name: string;
    email: string;
    mobileNo: string;
    employeeId: string;
    image: string | null;
    role: string;
    joiningDate: Date | string;
    employeeType: 'EMPLOYEE' | 'INTERN';
  };
  isEditMode?: boolean;
  roles?: RoleOption[];
}

export function EmployeeForm({ employee, isEditMode = false, roles = [] }: EmployeeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(employee?.image || null);

  // Ensure the employee's current role is included in the dropdown options
  const allRoles = [...roles];
  if (employee?.role && !allRoles.some((r) => r.name === employee.role)) {
    allRoles.unshift({ id: 'temp-current', name: employee.role });
  }

  // Initialize form
  const formattedJoiningDate = employee?.joiningDate
    ? new Date(employee.joiningDate).toISOString().split('T')[0]
    : '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeInput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name || '',
      email: employee?.email || '',
      mobileNo: employee?.mobileNo || '',
      employeeId: employee?.employeeId || '',
      image: employee?.image || null,
      role: employee?.role || '',
      joiningDate: formattedJoiningDate as any, // input[type="date"] binding
      employeeType: employee?.employeeType || 'EMPLOYEE',
    },
  });

  const employeeType = watch('employeeType');
  const imageValue = watch('image');

  // Handle image upload and encoding
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, WEBP, and GIF images are allowed.');
      return;
    }

    // Validate size (1MB)
    const maxSizeBytes = 1 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error('Image size must be less than 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setValue('image', base64String, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setImagePreview(null);
    setValue('image', null, { shouldValidate: true });
  };

  const onSubmit = async (data: EmployeeInput) => {
    setLoading(true);

    try {
      if (isEditMode && employee) {
        const result = await updateEmployee(employee.id, data);
        if (result.success) {
          toast.success('Employee updated successfully');
          router.push('/dashboard/employees');
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to update employee');
        }
      } else {
        const result = await createEmployee(data);
        if (result.success) {
          toast.success('Employee created successfully');
          router.push('/dashboard/employees');
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to create employee');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200/80 shadow-sm max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          {isEditMode ? 'Edit Employee Information' : 'Register New Employee'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Image Upload Row */}
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-slate-100">
            <div className="relative">
              {imagePreview ? (
                <div className="relative h-24 w-24 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full shadow-sm transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                  <Upload className="h-6 w-6 mb-1" />
                  <span className="text-[10px] font-semibold">1MB Max</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center sm:items-start gap-1">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                  Upload Photo
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </Label>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Supported formats: JPEG, PNG, WEBP, GIF.
              </p>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="name">Employee Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                disabled={loading}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                placeholder="EMP001"
                className={errors.employeeId ? 'border-destructive focus-visible:ring-destructive' : ''}
                disabled={loading}
                {...register('employeeId')}
              />
              {errors.employeeId && (
                <p className="text-xs font-medium text-destructive">{errors.employeeId.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="johndoe@mattengg.com"
                className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                disabled={loading}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="mobileNo">Mobile Number *</Label>
              <Input
                id="mobileNo"
                placeholder="9876543210"
                className={errors.mobileNo ? 'border-destructive focus-visible:ring-destructive' : ''}
                disabled={loading}
                {...register('mobileNo')}
              />
              {errors.mobileNo && (
                <p className="text-xs font-medium text-destructive">{errors.mobileNo.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="role">Designation / Role *</Label>
              <Select
                value={watch('role')}
                onValueChange={(val: any) => setValue('role', val, { shouldValidate: true })}
                disabled={loading}
              >
                <SelectTrigger className="w-full bg-background border border-input">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {allRoles.length === 0 ? (
                    <SelectItem value="unassigned" disabled>
                      No roles available. Please add roles first.
                    </SelectItem>
                  ) : (
                    allRoles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs font-medium text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="employeeType">Employee Type *</Label>
              <Select
                value={employeeType}
                onValueChange={(val: any) => setValue('employeeType', val, { shouldValidate: true })}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="INTERN">Intern</SelectItem>
                </SelectContent>
              </Select>
              {errors.employeeType && (
                <p className="text-xs font-medium text-destructive">{errors.employeeType.message}</p>
              )}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="joiningDate">Joining Date *</Label>
              <div className="relative">
                <Input
                  id="joiningDate"
                  type="date"
                  className={errors.joiningDate ? 'border-destructive focus-visible:ring-destructive pl-10' : 'pl-10'}
                  disabled={loading}
                  {...register('joiningDate')}
                />
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.joiningDate && (
                <p className="text-xs font-medium text-destructive">{errors.joiningDate.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="font-semibold">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Employee'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
export default EmployeeForm;
