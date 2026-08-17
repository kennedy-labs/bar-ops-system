import {
  Body,
  Controller,
  Delete,
  Get,
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
  getAll() {
    return this.productCostHistoryService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.productCostHistoryService.getById(id);
  }

  @Post()
  create(@Body() body: CreateProductCostHistoryDto) {
    return this.productCostHistoryService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductCostHistoryDto) {
    return this.productCostHistoryService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productCostHistoryService.remove(id);
  }
}
