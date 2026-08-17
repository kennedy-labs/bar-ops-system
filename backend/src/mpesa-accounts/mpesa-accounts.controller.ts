import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { MpesaAccountsService } from './mpesa-accounts.service';
import { CreateMpesaAccountDto } from './dto/create-mpesa-account.dto';
import { UpdateMpesaAccountDto } from './dto/update-mpesa-account.dto';

@Controller('mpesa-accounts')
export class MpesaAccountsController {
  constructor(private readonly mpesaAccountsService: MpesaAccountsService) {}

  @Get()
  getAll(@Query('businessId') businessId: string) {
    return this.mpesaAccountsService.getAll(businessId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Query('businessId') businessId: string) {
    return this.mpesaAccountsService.getById(id, businessId);
  }

  @Post()
  create(@Body() dto: CreateMpesaAccountDto) {
    return this.mpesaAccountsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Query('businessId') businessId: string,
    @Body() dto: UpdateMpesaAccountDto,
  ) {
    return this.mpesaAccountsService.update(id, businessId, dto as any);
  }

  @Post(':id/deactivate')
  deactivate(@Param('id') id: string, @Query('businessId') businessId: string) {
    return this.mpesaAccountsService.deactivate(id, businessId);
  }
}
