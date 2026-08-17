import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.expense.findMany();
  }

  getById(id: string) {
    return this.prisma.expense.findUnique({ where: { id } });
  }

  create(body: CreateExpenseDto) {
    return this.prisma.expense.create({ data: body as any });
  }

  update(id: string, body: UpdateExpenseDto) {
    return this.prisma.expense.update({ where: { id }, data: body as any });
  }

  remove(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }
}
