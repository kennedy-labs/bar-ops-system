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
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftOpenDto } from './dto/shift-open.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { ShiftsService } from './shifts.service';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post('close')
  close(@Headers('x-business-id') businessId: string, @Body() body: CloseShiftDto) {
    return this.shiftsService.close(businessId, body);
  }

  @Get()
  getAll(@Headers('x-business-id') businessId: string) {
    return this.shiftsService.getAll(businessId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.shiftsService.getById(id, businessId);
  }

  @Post()
  create(@Headers('x-business-id') businessId: string, @Body() body: CreateShiftDto) {
    return this.shiftsService.create(businessId, body);
  }

  @Post('open')
  open(@Headers('x-business-id') businessId: string, @Body() body: ShiftOpenDto) {
    return this.shiftsService.open(businessId, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: UpdateShiftDto) {
    return this.shiftsService.update(id, businessId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.shiftsService.remove(id, businessId);
  }
}
