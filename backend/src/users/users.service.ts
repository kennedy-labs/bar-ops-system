import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(businessId?: string) {
    if (businessId) {
      const userBusinesses = await this.prisma.userBusiness.findMany({
        where: { businessId },
        include: { user: true },
      });
      return userBusinesses.map((ub) => ub.user);
    }
    return this.prisma.user.findMany();
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

  async create(body: {
    name: string;
    businessId: string;
    branchId?: string;
    role?: 'OWNER' | 'WORKER';
    status?: 'ACTIVE' | 'INACTIVE';
    phone?: string;
    email?: string;
    password?: string;
  }) {
    const { businessId, ...userData } = body;
    const user = await this.prisma.user.create({
      data: userData as any,
    });

    await this.prisma.userBusiness.create({
      data: {
        userId: user.id,
        businessId,
        role: body.role ?? 'WORKER',
      },
    });

    return user;
  }

  async update(
    id: string,
    body: Partial<{
      name: string;
      branchId?: string;
      role?: 'OWNER' | 'WORKER';
      status?: 'ACTIVE' | 'INACTIVE';
      phone?: string;
      email?: string;
    }>,
  ) {
    const { businessId, ...updateData } = body as any;
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData as any,
    });

    if (businessId) {
      const existing = await this.prisma.userBusiness.findFirst({
        where: { userId: id, businessId },
      });
      if (!existing) {
        await this.prisma.userBusiness.create({
          data: {
            userId: id,
            businessId,
            role: body.role ?? 'WORKER',
          },
        });
      }
    }

    return user;
  }

  async remove(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async getBusinessesForUser(userId: string) {
    const userBusinesses = await this.prisma.userBusiness.findMany({
      where: { userId },
      include: { business: true },
    });
    return userBusinesses.map((ub) => ub.business);
  }
}
