import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryItemsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll() {
    return this.prisma.inventoryItem.findMany();
  }

  getById(id: string) {
    return this.prisma.inventoryItem.findUnique({
      where: { id },
    });
  }

  create(body: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: body,
    });
  }

  update(id: string, body: UpdateInventoryItemDto) {
    return this.prisma.inventoryItem.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string) {
    return this.prisma.inventoryItem.delete({
      where: { id },
    });
  }
}
