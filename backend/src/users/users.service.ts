import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
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

  create(body: { name: string; businessId: string; password?: string }) {
    return this.prisma.user.create({
      data: body,
    });
  }

  update(
    id: string,
    body: Partial<{
      name: string;
      businessId: string;
    }>,
  ) {
    return this.prisma.user.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
