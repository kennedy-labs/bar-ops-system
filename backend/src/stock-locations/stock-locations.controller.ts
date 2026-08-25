import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateStockLocationDto } from './dto/create-stock-location.dto';
import { UpdateStockLocationDto } from './dto/update-stock-location.dto';
import { StockLocationsService } from './stock-locations.service';

@Controller('stock-locations')
export class StockLocationsController {
  constructor(private readonly stockLocationsService: StockLocationsService) {}

  @Get()
  getAll(@Query('businessId') businessId?: string) {
    return this.stockLocationsService.getAll(businessId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.stockLocationsService.getById(id);
  }

  @Post()
  create(@Body() body: CreateStockLocationDto) {
    return this.stockLocationsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateStockLocationDto) {
    return this.stockLocationsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockLocationsService.remove(id);
  }
}
