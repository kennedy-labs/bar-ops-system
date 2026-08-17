import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardSummary(businessId: string) {
    // Top 5 products by sales, total revenue today, total expenses today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await this.prisma.shiftStockItem.findMany({
      where: { product: { businessId }, createdAt: { gte: today } },
      include: { product: true },
    });

    const revenue = sales.reduce((sum, s) => {
      const sold =
        s.openingQuantity - (s.closingQuantity || 0) + (s.addedQuantity || 0);
      return sum + sold * s.product.sellingPrice;
    }, 0);

    const expenses = await this.prisma.expense.findMany({
      where: { branch: { businessId }, createdAt: { gte: today } },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      revenue,
      expenses: totalExpenses,
      net: revenue - totalExpenses,
      generatedAt: new Date(),
    };
  }
}
