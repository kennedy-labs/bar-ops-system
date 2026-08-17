import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { MpesaTransactionsService } from './mpesa-transactions.service';
import { CreateMpesaTransactionDto } from './dto/create-mpesa-transaction.dto';

@Controller('mpesa-transactions')
export class MpesaTransactionsController {
  constructor(
    private readonly mpesaTransactionsService: MpesaTransactionsService,
  ) {}

  @Get()
  getAll(
    @Query('businessId') businessId: string,
    @Query('mpesaAccountId') mpesaAccountId?: string,
    @Query('shiftId') shiftId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.mpesaTransactionsService.findAll(businessId, {
      mpesaAccountId,
      shiftId,
      status,
      from,
      to,
    });
  }

  @Get('shift/:shiftId')
  getByShift(
    @Param('shiftId') shiftId: string,
    @Query('businessId') businessId: string,
  ) {
    if (!businessId) {
      throw new BadRequestException('businessId is required');
    }
    return this.mpesaTransactionsService.getByShift(shiftId, businessId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Query('businessId') businessId: string) {
    if (!businessId) {
      throw new BadRequestException('businessId is required');
    }
    return this.mpesaTransactionsService.getById(id, businessId);
  }

  @Post()
  create(@Body() dto: CreateMpesaTransactionDto) {
    return this.mpesaTransactionsService.create(dto);
  }
}
