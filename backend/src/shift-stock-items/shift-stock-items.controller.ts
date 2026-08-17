import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateShiftStockItemDto } from './dto/create-shift-stock-item.dto';
import { UpdateShiftStockItemDto } from './dto/update-shift-stock-item.dto';
import { ShiftStockItemsService } from './shift-stock-items.service';

@Controller('shift-stock-items')
export class ShiftStockItemsController {
  constructor(
    private readonly shiftStockItemsService: ShiftStockItemsService,
  ) {}

  @Get()
  getAll() {
    return this.shiftStockItemsService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.shiftStockItemsService.getById(id);
  }

  @Post()
  create(@Body() body: CreateShiftStockItemDto) {
    return this.shiftStockItemsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateShiftStockItemDto) {
    return this.shiftStockItemsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftStockItemsService.remove(id);
  }
}
