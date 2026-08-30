import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  BadRequestException,
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
    @Headers('x-business-id') businessId: string,
    @Query('mpesaAccountId') mpesaAccountId?: string,
    @Query('branchId') branchId?: string,
    @Query('shiftId') shiftId?: string,
    @Query('transactionType') transactionType?: string,
    @Query('status') status?: string,
    @Query('reconciliationStatus') reconciliationStatus?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.mpesaTransactionsService.findAll(businessId, {
      mpesaAccountId,
      branchId,
      shiftId,
      transactionType,
      status,
      reconciliationStatus,
      from,
      to,
    });
  }

  @Get('shift/:shiftId')
  getByShift(
    @Param('shiftId') shiftId: string,
    @Headers('x-business-id') businessId: string,
  ) {
    if (!businessId) {
      throw new BadRequestException('businessId is required');
    }
    return this.mpesaTransactionsService.getByShift(shiftId, businessId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    if (!businessId) {
      throw new BadRequestException('businessId is required');
    }
    return this.mpesaTransactionsService.getById(id, businessId);
  }

  @Post()
  create(@Headers('x-business-id') businessId: string, @Body() dto: CreateMpesaTransactionDto) {
    return this.mpesaTransactionsService.create(businessId, dto);
  }
}
