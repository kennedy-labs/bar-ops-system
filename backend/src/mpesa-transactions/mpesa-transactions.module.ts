import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MpesaTransactionsController } from './mpesa-transactions.controller';
import { MpesaTransactionsService } from './mpesa-transactions.service';

@Module({
  imports: [PrismaModule],
  controllers: [MpesaTransactionsController],
  providers: [MpesaTransactionsService],
})
export class MpesaTransactionsModule {}
