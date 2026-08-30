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
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';
import { ProductUnitsService } from './product-units.service';

@Controller('product-units')
export class ProductUnitsController {
  constructor(private readonly productUnitsService: ProductUnitsService) {}

  @Get()
  getAll(@Headers('x-business-id') businessId: string) {
    return this.productUnitsService.getAll(businessId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.productUnitsService.getById(id, businessId);
  }

  @Post()
  create(@Headers('x-business-id') businessId: string, @Body() body: CreateProductUnitDto) {
    return this.productUnitsService.create(businessId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: UpdateProductUnitDto) {
    return this.productUnitsService.update(id, businessId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.productUnitsService.remove(id, businessId);
  }
}
