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
import { CreateProductCostHistoryDto } from './dto/create-product-cost-history.dto';
import { UpdateProductCostHistoryDto } from './dto/update-product-cost-history.dto';
import { ProductCostHistoryService } from './product-cost-history.service';

@Controller('product-cost-history')
export class ProductCostHistoryController {
  constructor(
    private readonly productCostHistoryService: ProductCostHistoryService,
  ) {}

  @Get()
  getAll(@Headers('x-business-id') businessId: string) {
    return this.productCostHistoryService.getAll(businessId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.productCostHistoryService.getById(id, businessId);
  }

  @Post()
  create(@Headers('x-business-id') businessId: string, @Body() body: CreateProductCostHistoryDto) {
    return this.productCostHistoryService.create(businessId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: UpdateProductCostHistoryDto) {
    return this.productCostHistoryService.update(id, businessId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.productCostHistoryService.remove(id, businessId);
  }
}
