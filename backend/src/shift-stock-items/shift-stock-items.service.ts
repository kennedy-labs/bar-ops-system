import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftStockItemDto } from './dto/create-shift-stock-item.dto';
import { UpdateShiftStockItemDto } from './dto/update-shift-stock-item.dto';

@Injectable()
export class ShiftStockItemsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.shiftStockItem.findMany();
  }

  getById(id: string) {
    return this.prisma.shiftStockItem.findUnique({
      where: { id },
    });
  }

  create(body: CreateShiftStockItemDto) {
    return this.prisma.shiftStockItem.create({
      data: body,
    });
  }

  update(id: string, body: UpdateShiftStockItemDto) {
    return this.prisma.shiftStockItem.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string) {
    return this.prisma.shiftStockItem.delete({
      where: { id },
    });
  }
}
