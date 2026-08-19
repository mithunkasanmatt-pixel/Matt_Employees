import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  mobileNo: z.string().regex(/^\+?[0-9\s-]{10,15}$/, {
    message: 'Mobile number must be a valid phone number (10-15 digits)',
  }),
  employeeId: z.string().min(2, { message: 'Employee ID must be at least 2 characters' }),
  image: z.string().optional().nullable(),
  role: z.string().min(2, { message: 'Role must be at least 2 characters' }),
  joiningDate: z.string().min(1, { message: 'Joining date is required' }),
  employeeType: z.enum(['EMPLOYEE', 'INTERN'], {
    message: 'Employee Type must be EMPLOYEE or INTERN',
  }),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

export const deleteVerificationSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  employeeId: z.string().min(1, { message: 'Employee ID is required' }),
});

export type DeleteVerificationInput = z.infer<typeof deleteVerificationSchema>;
