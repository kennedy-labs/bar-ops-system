import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
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
  getAll(@Headers('x-business-id') businessId: string) {
    return this.stockLocationsService.getAll(businessId);
  }

  @Get(':id')
  getById(
    @Param('id') id: string,
    @Headers('x-business-id') businessId: string,
  ) {
    return this.stockLocationsService.getById(id, businessId);
  }

  @Post()
  create(
    @Headers('x-business-id') businessId: string,
    @Body() body: CreateStockLocationDto,
  ) {
    return this.stockLocationsService.create(businessId, body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Headers('x-business-id') businessId: string,
    @Body() body: UpdateStockLocationDto,
  ) {
    return this.stockLocationsService.update(id, businessId, body);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-business-id') businessId: string,
  ) {
    return this.stockLocationsService.remove(id, businessId);
  }
}
