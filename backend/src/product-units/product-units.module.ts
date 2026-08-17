import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductUnitsController } from './product-units.controller';
import { ProductUnitsService } from './product-units.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductUnitsController],
  providers: [ProductUnitsService],
})
export class ProductUnitsModule {}
