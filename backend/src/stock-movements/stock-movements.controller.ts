import {
  Body,
  Controller,
  Delete,
  Get,
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
  getAll() {
    return this.stockMovementsService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.stockMovementsService.getById(id);
  }

  @Post()
  create(@Body() body: CreateStockMovementDto) {
    return this.stockMovementsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateStockMovementDto) {
    return this.stockMovementsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockMovementsService.remove(id);
  }
}
