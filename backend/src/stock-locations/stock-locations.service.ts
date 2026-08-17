import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockLocationDto } from './dto/create-stock-location.dto';
import { UpdateStockLocationDto } from './dto/update-stock-location.dto';

@Injectable()
export class StockLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.stockLocation.findMany();
  }

  getById(id: string) {
    return this.prisma.stockLocation.findUnique({
      where: { id },
    });
  }

  create(body: CreateStockLocationDto) {
    return this.prisma.stockLocation.create({
      data: body,
    });
  }

  update(id: string, body: UpdateStockLocationDto) {
    return this.prisma.stockLocation.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string) {
    return this.prisma.stockLocation.delete({
      where: { id },
    });
  }
}
