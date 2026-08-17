import {
  Body,
  Controller,
  Delete,
  Get,
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
  getAll() {
    return this.productUnitsService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.productUnitsService.getById(id);
  }

  @Post()
  create(@Body() body: CreateProductUnitDto) {
    return this.productUnitsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateProductUnitDto) {
    return this.productUnitsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productUnitsService.remove(id);
  }
}
