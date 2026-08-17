import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.product.findMany();
  }

  getById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  create(body: CreateProductDto) {
    return this.prisma.product.create({
      data: body,
    });
  }

  update(id: string, body: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
