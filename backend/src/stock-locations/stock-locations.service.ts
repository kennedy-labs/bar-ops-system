import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockLocationDto } from './dto/create-stock-location.dto';
import { UpdateStockLocationDto } from './dto/update-stock-location.dto';

@Injectable()
export class StockLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(businessId: string) {
    return this.prisma.stockLocation.findMany({
      where: { businessId },
    });
  }

  getById(id: string, businessId: string) {
    return this.prisma.stockLocation.findFirst({
      where: { id, businessId },
    });
  }

  create(businessId: string, body: CreateStockLocationDto) {
    return this.prisma.stockLocation.create({
      data: { ...body, businessId },
    });
  }

  update(id: string, businessId: string, body: UpdateStockLocationDto) {
    return this.prisma.stockLocation.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string, businessId: string) {
    return this.prisma.stockLocation.delete({
      where: { id },
    });
  }
}
