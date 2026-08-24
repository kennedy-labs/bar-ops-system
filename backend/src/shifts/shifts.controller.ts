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
import { ShiftOpenDto } from './dto/shift-open.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { ShiftsService } from './shifts.service';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post('close')
  close(@Body() body: CloseShiftDto) {
    return this.shiftsService.close(body);
  }

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

  @Post('open')
  open(@Body() body: ShiftOpenDto) {
    return this.shiftsService.open(body);
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
