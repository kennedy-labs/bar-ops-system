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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  getAll(@Headers('x-business-id') businessId: string) {
    return this.expensesService.getAll(businessId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.expensesService.getById(id, businessId);
  }

  @Post()
  create(@Headers('x-business-id') businessId: string, @Body() body: CreateExpenseDto) {
    return this.expensesService.create(businessId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: UpdateExpenseDto) {
    return this.expensesService.update(id, businessId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.expensesService.remove(id, businessId);
  }

  @Post(':id/acknowledge')
  acknowledge(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: { acknowledgedByUserId: string }) {
    return this.expensesService.acknowledge(id, businessId, body.acknowledgedByUserId);
  }
}
