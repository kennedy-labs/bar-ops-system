import { Module } from '@nestjs/common';
import { MpesaAccountsService } from './mpesa-accounts.service';
import { MpesaAccountsController } from './mpesa-accounts.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MpesaAccountsController],
  providers: [MpesaAccountsService, PrismaService],
})
export class MpesaAccountsModule {}
