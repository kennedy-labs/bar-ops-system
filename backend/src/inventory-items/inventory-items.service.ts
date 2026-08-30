import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryItemsService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(businessId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { branch: { businessId } },
    });
  }

  getById(id: string, businessId: string) {
    return this.prisma.inventoryItem.findFirst({
      where: { id, branch: { businessId } },
    });
  }

  create(businessId: string, body: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: body as any,
    });
  }

  update(id: string, businessId: string, body: UpdateInventoryItemDto) {
    return this.prisma.inventoryItem.update({
      where: { id },
      data: body,
    });
  }

  remove(id: string, businessId: string) {
    return this.prisma.inventoryItem.delete({
      where: { id },
    });
  }
}
