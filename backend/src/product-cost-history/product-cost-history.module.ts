import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductCostHistoryController } from './product-cost-history.controller';
import { ProductCostHistoryService } from './product-cost-history.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductCostHistoryController],
  providers: [ProductCostHistoryService],
})
export class ProductCostHistoryModule {}
