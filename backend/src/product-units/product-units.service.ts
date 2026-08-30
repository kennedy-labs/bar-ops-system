import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';

@Injectable()
export class ProductUnitsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(businessId: string) {
    return this.prisma.productUnit.findMany({
      where: { product: { businessId } },
    });
  }

  getById(id: string, businessId: string) {
    return this.prisma.productUnit.findFirst({
      where: { id, product: { businessId } },
    });
  }

  create(businessId: string, body: CreateProductUnitDto) {
    return this.prisma.productUnit.create({
      data: { ...body, businessId } as any,
    });
  }

  update(id: string, businessId: string, body: UpdateProductUnitDto) {
    return this.prisma.productUnit.update({
      where: { id },
      data: body as any,
    });
  }

  remove(id: string, businessId: string) {
    return this.prisma.productUnit.delete({
      where: { id },
    });
  }
}
