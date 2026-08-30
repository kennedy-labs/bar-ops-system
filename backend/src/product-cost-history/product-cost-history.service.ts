import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductCostHistoryDto } from './dto/create-product-cost-history.dto';
import { UpdateProductCostHistoryDto } from './dto/update-product-cost-history.dto';

@Injectable()
export class ProductCostHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(businessId: string) {
    return this.prisma.productCostHistory.findMany({
      where: { product: { businessId } },
    });
  }

  getById(id: string, businessId: string) {
    return this.prisma.productCostHistory.findFirst({
      where: { id, product: { businessId } },
    });
  }

  create(businessId: string, body: CreateProductCostHistoryDto) {
    return this.prisma.productCostHistory.create({
      data: body,
    });
  }

  update(id: string, businessId: string, body: UpdateProductCostHistoryDto) {
    return this.prisma.productCostHistory.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string, businessId: string) {
    return this.prisma.productCostHistory.delete({
      where: { id },
    });
  }
}
