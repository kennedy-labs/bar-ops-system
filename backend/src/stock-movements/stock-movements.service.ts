import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.stockMovement.findMany();
  }

  getById(id: string) {
    return this.prisma.stockMovement.findUnique({
      where: { id },
    });
  }

  create(body: CreateStockMovementDto) {
    return this.prisma.stockMovement.create({
      data: body,
    });
  }

  update(id: string, body: UpdateStockMovementDto) {
    return this.prisma.stockMovement.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string) {
    return this.prisma.stockMovement.delete({
      where: { id },
    });
  }
}
