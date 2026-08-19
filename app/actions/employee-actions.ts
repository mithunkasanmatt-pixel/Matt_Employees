'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { employeeSchema, deleteVerificationSchema } from '@/lib/validations/employee';

// Helper to verify admin session
async function verifyAdminSession() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized. Admin session required.');
  }
}

// Helper to validate base64 image size and type
function validateImage(base64Image: string | null | undefined) {
  if (!base64Image) return;

  // Expecting format: data:image/png;base64,... or similar
  const match = base64Image.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid image format. Only standard images are supported.');
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const sizeInBytes = (base64Data.length * 3) / 4 - (base64Data.indexOf('=') > 0 ? (base64Data.length - base64Data.indexOf('=')) : 0);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(mimeType)) {
    throw new Error('Only JPEG, PNG, WEBP, and GIF images are allowed.');
  }

  const maxSizeBytes = 1 * 1024 * 1024; // 1 MB limit
  if (sizeInBytes > maxSizeBytes) {
    throw new Error('Image size must be less than 1MB.');
  }
}

export async function createEmployee(data: any) {
  try {
    await verifyAdminSession();

    // Parse and validate using Zod
    const validatedData = employeeSchema.parse(data);

    // Validate image if provided
    validateImage(validatedData.image);

    // Check for duplicate Employee ID
    const duplicateId = await prisma.employee.findUnique({
      where: { employeeId: validatedData.employeeId },
    });

    if (duplicateId) {
      return { success: false, error: 'Employee ID is already in use' };
    }

    // Check for duplicate Email
    const duplicateEmail = await prisma.employee.findUnique({
      where: { email: validatedData.email },
    });

    if (duplicateEmail) {
      return { success: false, error: 'Email address is already registered' };
    }

    // Save in PostgreSQL
    const employee = await prisma.employee.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        mobileNo: validatedData.mobileNo,
        employeeId: validatedData.employeeId,
        image: validatedData.image,
        role: validatedData.role,
        joiningDate: new Date(validatedData.joiningDate),
        employeeType: validatedData.employeeType,
      },
    });

    revalidatePath('/dashboard/employees');
    revalidatePath('/dashboard');

    return { success: true, employeeId: employee.id };
  } catch (error: any) {
    console.error('Create employee error:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}

export async function updateEmployee(id: string, data: any) {
  try {
    await verifyAdminSession();

    // Parse and validate using Zod
    const validatedData = employeeSchema.parse(data);

    // Validate image if provided
    validateImage(validatedData.image);

    // Check for duplicate Employee ID on other employees
    const duplicateId = await prisma.employee.findFirst({
      where: {
        employeeId: validatedData.employeeId,
        id: { not: id },
      },
    });

    if (duplicateId) {
      return { success: false, error: 'Employee ID is already in use by another employee' };
    }

    // Check for duplicate Email on other employees
    const duplicateEmail = await prisma.employee.findFirst({
      where: {
        email: validatedData.email,
        id: { not: id },
      },
    });

    if (duplicateEmail) {
      return { success: false, error: 'Email address is already in use by another employee' };
    }

    // Update in PostgreSQL
    await prisma.employee.update({
      where: { id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        mobileNo: validatedData.mobileNo,
        employeeId: validatedData.employeeId,
        image: validatedData.image,
        role: validatedData.role,
        joiningDate: new Date(validatedData.joiningDate),
        employeeType: validatedData.employeeType,
      },
    });

    revalidatePath('/dashboard/employees');
    revalidatePath(`/dashboard/employees/${id}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Update employee error:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}

export async function deleteEmployee(id: string, verificationData: any) {
  try {
    await verifyAdminSession();

    // Validate verification data
    const verifiedInput = deleteVerificationSchema.parse(verificationData);

    // Get employee from database
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return { success: false, error: 'Employee not found' };
    }

    // Verify email and employee ID matches exactly
    if (
      employee.email.trim().toLowerCase() !== verifiedInput.email.trim().toLowerCase() ||
      employee.employeeId.trim() !== verifiedInput.employeeId.trim()
    ) {
      return { success: false, error: 'Employee Email and Employee ID do not match the employee record.' };
    }

    // Delete employee
    await prisma.employee.delete({
      where: { id },
    });

    revalidatePath('/dashboard/employees');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Delete employee error:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}
