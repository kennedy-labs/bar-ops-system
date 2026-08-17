import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ShiftStockItemsController } from './shift-stock-items.controller';
import { ShiftStockItemsService } from './shift-stock-items.service';

@Module({
  imports: [PrismaModule],
  controllers: [ShiftStockItemsController],
  providers: [ShiftStockItemsService],
})
export class ShiftStockItemsModule {}
