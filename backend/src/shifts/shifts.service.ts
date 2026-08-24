import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftOpenDto } from './dto/shift-open.dto';
import { ShiftStockItemsService } from '../shift-stock-items/shift-stock-items.service';

@Injectable()
export class ShiftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shiftStockItemsService: ShiftStockItemsService,
  ) {}

  getAll() {
    return this.prisma.shift.findMany();
  }

  getById(id: string) {
    return this.prisma.shift.findUnique({
      where: { id },
    });
  }

  create(body: CreateShiftDto) {
    return this.prisma.shift.create({
      data: body,
    });
  }

  update(id: string, body: UpdateShiftDto) {
    return this.prisma.shift.update({
      where: { id },
      data: body,
    });
  }

    remove(id: string) {
    return this.prisma.shift.delete({
      where: { id },
    });
  }

  async open(body: ShiftOpenDto) {
    const { branchId, userId, items } = body;

    const shift = await this.prisma.shift.create({
      data: {
        branchId,
        userId,
        openedAt: new Date(),
      },
    });

    // Persist each opening-count as a shiftStockItem record (the real model)
    await this.prisma.shiftStockItem.createMany({
      data: items.map((item) => ({
        shiftId: shift.id,
        productId: item.productId,
        openingQuantity: item.openingQuantity,
      })),
    });

    return shift;
  }
}
