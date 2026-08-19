'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const roleSchema = z.object({
  name: z.string().min(2, { message: 'Role name must be at least 2 characters long.' }),
});

async function verifyAdminSession() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized. Admin session required.');
  }
}

export async function createRole(data: { name: string }) {
  try {
    await verifyAdminSession();

    // Validate using Zod
    const validatedData = roleSchema.parse(data);

    // Normalize name
    const roleName = validatedData.name.trim();

    // Check for duplicate
    const duplicate = await prisma.role.findFirst({
      where: {
        name: {
          equals: roleName,
          mode: 'insensitive',
        },
      },
    });

    if (duplicate) {
      return { success: false, error: 'A role with this name already exists.' };
    }

    // Create in database
    const role = await prisma.role.create({
      data: {
        name: roleName,
      },
    });

    revalidatePath('/dashboard/roles');
    revalidatePath('/dashboard/employees/new');
    revalidatePath('/dashboard/employees/[id]/edit');

    return { success: true, roleId: role.id };
  } catch (error: any) {
    console.error('Create role error:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}

export async function deleteRole(id: string) {
  try {
    await verifyAdminSession();

    await prisma.role.delete({
      where: { id },
    });

    revalidatePath('/dashboard/roles');
    revalidatePath('/dashboard/employees/new');
    revalidatePath('/dashboard/employees/[id]/edit');

    return { success: true };
  } catch (error: any) {
    console.error('Delete role error:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}

export async function getRoles() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return roles;
  } catch (error) {
    console.error('Get roles error:', error);
    return [];
  }
}
