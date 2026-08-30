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
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';
import { StockMovementsService } from './stock-movements.service';

@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  getAll(@Headers('x-business-id') businessId: string) {
    return this.stockMovementsService.getAll(businessId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.stockMovementsService.getById(id, businessId);
  }

  @Post()
  create(@Headers('x-business-id') businessId: string, @Body() body: CreateStockMovementDto) {
    return this.stockMovementsService.create(businessId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: UpdateStockMovementDto) {
    return this.stockMovementsService.update(id, businessId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.stockMovementsService.remove(id, businessId);
  }
}
