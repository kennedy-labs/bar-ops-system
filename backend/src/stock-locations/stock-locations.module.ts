import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StockLocationsController } from './stock-locations.controller';
import { StockLocationsService } from './stock-locations.service';

@Module({
  imports: [PrismaModule],
  controllers: [StockLocationsController],
  providers: [StockLocationsService],
})
export class StockLocationsModule {}
