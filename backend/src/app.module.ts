import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { BranchesModule } from './branches/branches.module';

@Module({
  imports: [UsersModule, ProductsModule, BranchesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
