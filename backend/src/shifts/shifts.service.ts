import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftOpenDto } from './dto/shift-open.dto';
import { CloseShiftDto } from './dto/close-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(businessId: string) {
    return this.prisma.shift.findMany({
      where: { branch: { businessId } },
    });
  }

  getById(id: string, businessId: string) {
    return this.prisma.shift.findFirst({
      where: { id, branch: { businessId } },
    });
  }

  create(businessId: string, body: CreateShiftDto) {
    return this.prisma.shift.create({
      data: { ...body, businessId } as any,
    });
  }

  update(id: string, businessId: string, body: UpdateShiftDto) {
    return this.prisma.shift.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string, businessId: string) {
    return this.prisma.shift.delete({
      where: { id },
    });
  }

  async open(businessId: string, body: ShiftOpenDto) {
    const { branchId, userId, items } = body;

    const shift = await this.prisma.shift.create({
      data: {
        branchId,
        userId,
        openedAt: new Date(),
      },
    });

    await this.prisma.shiftStockItem.createMany({
      data: items.map((item) => ({
        shiftId: shift.id,
        productId: item.productId,
        productUnitId: item.productUnitId,
        stockLocationId: item.stockLocationId,
        businessId,
        branchId,
        openingQuantity: item.openingQuantity,
      })),
    });

    return shift;
  }

  async close(businessId: string, body: CloseShiftDto) {
    const { shiftId, items } = body;

    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        shiftStockItems: {
          include: { product: true },
        },
        branch: true,
      },
    });

    if (!shift) throw new Error("Shift not found");
    if (shift.closedAt) throw new Error("Shift already closed");
    if (shift.branch.businessId !== businessId) {
      throw new Error("Shift does not belong to business");
    }

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
            productUnitId: item.productUnitId,
            businessId,
            branchId: shift.branchId,
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
