import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(businessId: string) {
    return this.prisma.stockMovement.findMany({
      where: { businessId },
    });
  }

  getById(id: string, businessId: string) {
    return this.prisma.stockMovement.findFirst({
      where: { id, businessId },
    });
  }

  create(businessId: string, body: CreateStockMovementDto) {
    return this.prisma.stockMovement.create({
      data: { ...body, businessId },
    });
  }

  update(id: string, businessId: string, body: UpdateStockMovementDto) {
    return this.prisma.stockMovement.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string, businessId: string) {
    return this.prisma.stockMovement.delete({
      where: { id },
    });
  }
}
