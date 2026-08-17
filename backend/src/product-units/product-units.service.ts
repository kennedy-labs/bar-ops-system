import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';

@Injectable()
export class ProductUnitsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.productUnit.findMany();
  }

  getById(id: string) {
    return this.prisma.productUnit.findUnique({
      where: { id },
    });
  }

  create(body: CreateProductUnitDto) {
    return this.prisma.productUnit.create({
      data: body,
    });
  }

  update(id: string, body: UpdateProductUnitDto) {
    return this.prisma.productUnit.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string) {
    return this.prisma.productUnit.delete({
      where: { id },
    });
  }
}
