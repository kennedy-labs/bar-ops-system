import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftStockItemDto } from './dto/create-shift-stock-item.dto';
import { UpdateShiftStockItemDto } from './dto/update-shift-stock-item.dto';

@Injectable()
export class ShiftStockItemsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(businessId: string) {
    return this.prisma.shiftStockItem.findMany({
      where: { shift: { branch: { businessId } } },
    });
  }

  getById(id: string, businessId: string) {
    return this.prisma.shiftStockItem.findFirst({
      where: { id, shift: { branch: { businessId } } },
    });
  }

  create(businessId: string, body: CreateShiftStockItemDto) {
    return this.prisma.shiftStockItem.create({
      data: { ...body, businessId },
    });
  }

  update(id: string, businessId: string, body: UpdateShiftStockItemDto) {
    return this.prisma.shiftStockItem.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string, businessId: string) {
    return this.prisma.shiftStockItem.delete({
      where: { id },
    });
  }
}
