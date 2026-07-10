import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { BranchesService } from './branches.service';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  getAll() {
    return this.branchesService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.branchesService.getById(id);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.branchesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.branchesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.branchesService.remove(id);
  }
}