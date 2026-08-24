import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftOpenDto } from './dto/shift-open.dto';
import { CloseShiftDto } from './dto/close-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async close(body: CloseShiftDto) {
    const { shiftId, items } = body;

    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        shiftStockItems: {
          include: { product: true },
        },
      },
    });

    if (!shift) throw new Error("Shift not found");
    if (shift.closedAt) throw new Error("Shift already closed");

    for (const item of items) {
      const existing = shift.shiftStockItems.find(
        (ssi) => ssi.productId === item.productId,
      );

      if (existing) {
        await this.prisma.shiftStockItem.update({
          where: { id: existing.id },
          data: {
            closingQuantity: item.actualQuantity,
            addedQuantity: item.addedQuantity ?? existing.addedQuantity ?? 0,
          },
        });
      } else {
        await this.prisma.shiftStockItem.create({
          data: {
            shiftId: shift.id,
            productId: item.productId,
            openingQuantity: 0,
            addedQuantity: item.addedQuantity ?? 0,
            closingQuantity: item.actualQuantity,
          },
        });
      }
    }

    const closed = await this.prisma.shift.update({
      where: { id: shiftId },
      data: { closedAt: new Date() },
      include: {
        shiftStockItems: {
          include: { product: true },
        },
      },
    });

      const computed = closed.shiftStockItems.map((ssi: any) => {
      const soldQty = ssi.openingQuantity + (ssi.addedQuantity ?? 0) - (ssi.closingQuantity ?? 0);
      const sellingPrice = ssi.product.sellingPrice ?? 0;
      const costHistory = ssi.product.costHistory ?? [];
      const latestCost = costHistory.length > 0
        ? Number(costHistory[0]?.cost ?? 0)
        : 0;
      const revenue = soldQty * sellingPrice;
      const cost = soldQty * latestCost;
      const netProfit = revenue - cost;
      return {
        productId: ssi.productId,
        productName: ssi.product.name,
        unit: ssi.product.units?.[0]?.name ?? "unit",
        openingQuantity: ssi.openingQuantity,
        addedQuantity: ssi.addedQuantity ?? 0,
        soldQty,
        closingQuantity: ssi.closingQuantity ?? 0,
        sellingPrice,
        unitCost: latestCost,
        revenue,
        cost,
        netProfit,
      };
    });

    return {
      shiftId: closed.id,
      closedAt: closed.closedAt,
      items: computed,
    };
  }
}
