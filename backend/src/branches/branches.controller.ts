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
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  getAll(@Headers('x-business-id') businessId: string) {
    return this.branchesService.getAll(businessId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.branchesService.getById(id, businessId);
  }

  @Post()
  create(@Headers('x-business-id') businessId: string, @Body() dto: CreateBranchDto) {
    return this.branchesService.create(businessId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() dto: UpdateBranchDto) {
    return this.branchesService.update(id, businessId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.branchesService.remove(id, businessId);
  }
}
