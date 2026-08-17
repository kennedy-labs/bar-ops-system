import {
  Body,
  Controller,
  Delete,
  Get,
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
  getAll() {
    return this.transfersService.getAll();
  }

  @Get('by-branch/:branchId')
  getByBranch(
    @Param('branchId') branchId: string,
    @Query('role') role?: 'SENDER' | 'RECEIVER',
  ) {
    return this.transfersService.getByBranch(branchId, role);
  }

  @Get(':id/discrepancies')
  getDiscrepancies(@Param('id') id: string) {
    return this.transfersService.getDiscrepancies(id);
  }

  @Get(':id/stock-movements')
  getStockMovements(@Param('id') id: string) {
    return this.transfersService.getStockMovements(id);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.transfersService.getById(id);
  }

  @Post()
  create(@Body() body: CreateTransferDto) {
    return this.transfersService.create(body);
  }

  @Post(':id/dispatch')
  dispatch(@Param('id') id: string, @Body() body: DispatchTransferDto) {
    return this.transfersService.dispatch(id, body);
  }

  @Post(':id/receive')
  receive(@Param('id') id: string, @Body() body: ReceiveTransferDto) {
    return this.transfersService.receive(id, body);
  }

  @Post(':id/receiver')
  setReceiverUser(@Param('id') id: string, @Body() body: SetReceiverUserDto) {
    return this.transfersService.setReceiverUser(id, body);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body() body: CancelTransferDto) {
    return this.transfersService.cancel(id, body);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() body: RejectTransferDto) {
    return this.transfersService.reject(id, body);
  }

  @Get(':id/items')
  getItems(@Param('id') id: string) {
    return this.transfersService.getItems(id);
  }

  @Post(':id/items')
  addItems(@Param('id') id: string, @Body() body: AddTransferItemsDto) {
    return this.transfersService.addItems(id, body);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transfersService.remove(id);
  }
}
