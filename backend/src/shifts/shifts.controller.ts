import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftsService } from './shifts.service';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get()
  getAll() {
    return this.shiftsService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.shiftsService.getById(id);
  }

  @Post()
  create(@Body() body: CreateShiftDto) {
    return this.shiftsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateShiftDto) {
    return this.shiftsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftsService.remove(id);
  }
}
