import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItemsService } from './inventory-items.service';

@Controller('inventory-items')
export class InventoryItemsController {
  constructor(private readonly inventoryItemsService: InventoryItemsService) {}

  @Get()
  getAll() {
    return this.inventoryItemsService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.inventoryItemsService.getById(id);
  }

  @Post()
  create(@Body() body: CreateInventoryItemDto) {
    return this.inventoryItemsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateInventoryItemDto) {
    return this.inventoryItemsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryItemsService.remove(id);
  }
}
