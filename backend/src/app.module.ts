import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { BranchesModule } from './branches/branches.module';
import { BusinessModule } from './business/business.module';
import { ShiftsModule } from './shifts/shifts.module';
import { InventoryItemsModule } from './inventory-items/inventory-items.module';
import { ProductCostHistoryModule } from './product-cost-history/product-cost-history.module';
import { ProductUnitsModule } from './product-units/product-units.module';
import { StockLocationsModule } from './stock-locations/stock-locations.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { ShiftStockItemsModule } from './shift-stock-items/shift-stock-items.module';
import { TransfersModule } from './transfers/transfers.module';
import { MpesaAccountsModule } from './mpesa-accounts/mpesa-accounts.module';
import { MpesaTransactionsModule } from './mpesa-transactions/mpesa-transactions.module';
import { ExpensesModule } from './expenses/expenses.module';
import { DiscrepanciesModule } from './discrepancies/discrepancies.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { AnalyticsModule } from './analytics/analytics.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '.env'),
    }),
    PrismaModule,
    BusinessModule,
    UsersModule,
    ProductsModule,
    BranchesModule,
    ShiftsModule,
    InventoryItemsModule,
    ProductCostHistoryModule,
    ProductUnitsModule,
    StockLocationsModule,
    StockMovementsModule,
    ShiftStockItemsModule,
    TransfersModule,
    MpesaAccountsModule,
    MpesaTransactionsModule,
    ExpensesModule,
    DiscrepanciesModule,
    AuthModule,
    ReportsModule,
    AnalyticsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
