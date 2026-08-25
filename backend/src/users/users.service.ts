import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(businessId?: string) {
    return this.prisma.user.findMany({
      where: businessId ? { businessId } : undefined,
    });
  }

  getById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByName(name: string) {
    return this.prisma.user.findFirst({
      where: { name },
    });
  }

  create(body: {
    name: string;
    businessId: string;
    branchId?: string;
    role?: 'OWNER' | 'MANAGER' | 'WORKER';
    status?: 'ACTIVE' | 'INACTIVE';
    phone?: string;
    email?: string;
    password?: string;
  }) {
    return this.prisma.user.create({
      data: body as any,
    });
  }

  update(
    id: string,
    body: Partial<{
      name: string;
      businessId: string;
      branchId?: string;
      role?: 'OWNER' | 'MANAGER' | 'WORKER';
      status?: 'ACTIVE' | 'INACTIVE';
      phone?: string;
      email?: string;
    }>,
  ) {
    return this.prisma.user.update({
      where: { id },
      data: body as any,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
