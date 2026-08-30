import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { AddTransferItemsDto } from './dto/add-transfer-items.dto';
import { DispatchTransferDto } from './dto/dispatch-transfer.dto';
import { ReceiveTransferDto } from './dto/receive-transfer.dto';
import { SetReceiverUserDto } from './dto/set-receiver-user.dto';
import { CancelTransferDto } from './dto/cancel-transfer.dto';
import { RejectTransferDto } from './dto/reject-transfer.dto';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Get()
  getAll(@Headers('x-business-id') businessId: string) {
    return this.transfersService.getAll(businessId);
  }

  @Get('by-branch/:branchId')
  getByBranch(
    @Param('branchId') branchId: string,
    @Query('role') role?: 'SENDER' | 'RECEIVER',
    @Headers('x-business-id') businessId?: string,
  ) {
    return this.transfersService.getByBranch(branchId, role, businessId);
  }

  @Get(':id/discrepancies')
  getDiscrepancies(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.transfersService.getDiscrepancies(id, businessId);
  }

  @Get(':id/stock-movements')
  getStockMovements(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.transfersService.getStockMovements(id, businessId);
  }

  @Get(':id')
  getById(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.transfersService.getById(id, businessId);
  }

  @Post()
  create(@Headers('x-business-id') businessId: string, @Body() body: CreateTransferDto) {
    return this.transfersService.create(businessId, body);
  }

  @Post(':id/dispatch')
  dispatch(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: DispatchTransferDto) {
    return this.transfersService.dispatch(id, businessId, body);
  }

  @Post(':id/receive')
  receive(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: ReceiveTransferDto) {
    return this.transfersService.receive(id, businessId, body);
  }

  @Post(':id/receiver')
  setReceiverUser(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: SetReceiverUserDto) {
    return this.transfersService.setReceiverUser(id, businessId, body);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: CancelTransferDto) {
    return this.transfersService.cancel(id, businessId, body);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: RejectTransferDto) {
    return this.transfersService.reject(id, businessId, body);
  }

  @Get(':id/items')
  getItems(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.transfersService.getItems(id, businessId);
  }

  @Post(':id/items')
  addItems(@Param('id') id: string, @Headers('x-business-id') businessId: string, @Body() body: AddTransferItemsDto) {
    return this.transfersService.addItems(id, businessId, body);
  }
  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-business-id') businessId: string) {
    return this.transfersService.remove(id, businessId);
  }
}
