import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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
  getAll(@Headers('x-business-id') businessId: string) {
    return this.shiftStockItemsService.getAll(businessId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.shiftStockItemsService.getById(id, businessId);
  }

  @Post()
  create(@Headers('x-business-id') businessId: string, @Body() body: CreateShiftStockItemDto) {
    return this.shiftStockItemsService.create(businessId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: UpdateShiftStockItemDto) {
    return this.shiftStockItemsService.update(id, businessId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.shiftStockItemsService.remove(id, businessId);
  }
}
