import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockLocationDto } from './dto/create-stock-location.dto';
import { UpdateStockLocationDto } from './dto/update-stock-location.dto';

@Injectable()
export class StockLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(businessId?: string) {
    return this.prisma.stockLocation.findMany({
      where: businessId ? { businessId } : undefined,
    });
  }

  getById(id: string) {
    return this.prisma.stockLocation.findUnique({
      where: { id },
    });
  }

  async create(body: CreateStockLocationDto) {
    let businessId = body.businessId;
    if (!businessId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: body.branchId },
        select: { businessId: true },
      });
      if (!branch) throw new Error('Branch not found');
      businessId = branch.businessId;
    }
    return this.prisma.stockLocation.create({
      data: {
        businessId,
        branchId: body.branchId,
        name: body.name,
        type: body.type,
        description: body.description,
        status: body.status,
      },
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
