import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  getAll() {
    return this.expensesService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.expensesService.getById(id);
  }

  @Post()
  create(@Body() body: CreateExpenseDto) {
    return this.expensesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateExpenseDto) {
    return this.expensesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
