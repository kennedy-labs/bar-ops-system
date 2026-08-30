import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(businessId: string) {
    return this.prisma.expense.findMany({
      where: { branch: { businessId } },
    });
  }

  getById(id: string, businessId: string) {
    return this.prisma.expense.findFirst({
      where: { id, branch: { businessId } },
    });
  }

  create(businessId: string, body: CreateExpenseDto) {
    return this.prisma.expense.create({ data: { ...body, businessId } as any });
  }

  update(id: string, businessId: string, body: UpdateExpenseDto) {
    return this.prisma.expense.update({ where: { id }, data: body as any });
  }

  remove(id: string, businessId: string) {
    return this.prisma.expense.delete({ where: { id } });
  }

  async acknowledge(id: string, businessId: string, acknowledgedByUserId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, branch: { businessId } },
    });
    if (!expense) {
      throw new NotFoundException(`Expense ${id} not found`);
    }

    return this.prisma.expense.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedByUserId,
        acknowledgedAt: new Date(),
      },
    });
  }
}
