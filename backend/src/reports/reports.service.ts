import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { InventoryReport } from './types/inventory-report';
import { SalesReport } from './types/sales-report';
import { ExpenseReport } from './types/expense-report';
import { MpesaReport } from './types/mpesa-report';
import { DiscrepancyReport } from './types/discrepancy-report';
import { ProfitReport } from './types/profit-report';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async validateOwnership(businessId: string, filters: { branchId?: string; shiftId?: string; productId?: string }) {
    const { branchId, shiftId, productId } = filters;

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) {
      throw new BadRequestException('Invalid businessId');
    }

    if (branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
      });
      if (!branch || branch.businessId !== businessId) {
        throw new BadRequestException(
          'Invalid branchId or does not belong to business',
        );
      }
    }

    if (shiftId) {
      const shift = await this.prisma.shift.findUnique({
        where: { id: shiftId },
        include: { branch: true },
      });
      if (!shift || shift.branch.businessId !== businessId) {
        throw new BadRequestException(
          'Invalid shiftId or does not belong to business',
        );
      }
    }

    if (productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product || product.businessId !== businessId) {
        throw new BadRequestException(
          'Invalid productId or does not belong to business',
        );
      }
    }
  }

  async getInventoryReport(businessId: string, filters: ReportFilterDto): Promise<InventoryReport> {
    await this.validateOwnership(businessId, filters);

    const { branchId, productId } = filters;

    const where: any = {
      branch: { businessId },
    };

    if (branchId) {
      where.branchId = branchId;
    }
    if (productId) {
      where.productId = productId;
    }

    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where,
      include: {
        product: true,
        stockLocation: true,
      },
    });

    return {
      items: inventoryItems.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        stockLocation: item.stockLocation?.name || 'Unknown',
      })),
      generatedAt: new Date(),
    };
  }

  async getSalesReport(businessId: string, filters: ReportFilterDto): Promise<SalesReport> {
    await this.validateOwnership(businessId, filters);
    const { branchId, productId, startDate, endDate } = filters;
    const where: any = { product: { businessId } };
    if (branchId) where.shift = { branchId };
    if (productId) where.productId = productId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const sales = await this.prisma.shiftStockItem.findMany({
      where,
      include: { product: true },
    });

    const items = sales.reduce((acc: any[], sale: any) => {
      const existing = acc.find((i) => i.productId === sale.productId);
      const sold =
        sale.openingQuantity -
        (sale.closingQuantity || 0) +
        (sale.addedQuantity || 0);
      if (existing) {
        existing.totalSold += sold;
      } else {
        acc.push({
          productId: sale.productId,
          productName: sale.product.name,
          totalSold: sold,
        });
      }
      return acc;
    }, []);

    return { items, generatedAt: new Date() };
  }

  async getExpenseReport(businessId: string, filters: ReportFilterDto): Promise<ExpenseReport> {
    await this.validateOwnership(businessId, filters);
    const { branchId, startDate, endDate } = filters;
    const where: any = { branch: { businessId } };
    if (branchId) where.branchId = branchId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      include: { branch: true },
    });

    return {
      items: expenses.map((e) => ({
        id: e.id,
        amount: e.amount,
        description: e.description || '',
        branchName: e.branch.name,
        createdAt: e.createdAt,
      })),
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      generatedAt: new Date(),
    };
  }

  async getMpesaReport(businessId: string, filters: ReportFilterDto): Promise<MpesaReport> {
    await this.validateOwnership(businessId, filters);
    const { startDate, endDate } = filters;
    const where: any = { businessId };
    if (startDate || endDate) {
      where.transactionTime = {};
      if (startDate) where.transactionTime.gte = new Date(startDate);
      if (endDate) where.transactionTime.lte = new Date(endDate);
    }

    const transactions = await this.prisma.mpesaTransaction.findMany({
      where,
      include: { mpesaAccount: true },
    });

    return {
      items: transactions.map((t) => ({
        id: t.id,
        amount: t.amount.toNumber(),
        transactionTime: t.transactionTime,
        status: t.status,
        accountName: t.mpesaAccount.displayName,
      })),
      totalReceived: transactions.reduce(
        (sum, t) => sum + t.amount.toNumber(),
        0,
      ),
      generatedAt: new Date(),
    };
  }

  async getDiscrepancyReport(
    businessId: string,
    filters: ReportFilterDto,
  ): Promise<DiscrepancyReport> {
    await this.validateOwnership(businessId, filters);
    const { branchId, startDate, endDate } = filters;
    const where: any = { businessId };
    if (branchId) where.branchId = branchId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const discrepancies = await this.prisma.discrepancy.findMany({ where });

    return {
      items: discrepancies.map((d) => ({
        id: d.id,
        type: d.type,
        status: d.status,
        variance: d.variance.toNumber(),
        sourceReference: d.sourceReference,
      })),
      generatedAt: new Date(),
    };
  }

  async getProfitReport(businessId: string, filters: ReportFilterDto): Promise<ProfitReport> {
    await this.validateOwnership(businessId, filters);
    const { branchId, startDate, endDate } = filters;

    const salesWhere: any = { product: { businessId } };
    if (branchId) salesWhere.shift = { branchId };
    if (startDate || endDate) {
      salesWhere.createdAt = {};
      if (startDate) salesWhere.createdAt.gte = new Date(startDate);
      if (endDate) salesWhere.createdAt.lte = new Date(endDate);
    }
    const sales = await this.prisma.shiftStockItem.findMany({
      where: salesWhere,
      include: { product: true },
    });

    let totalRevenue = new Prisma.Decimal(0);
    let totalCost = new Prisma.Decimal(0);

    for (const sale of sales) {
      const soldQty =
        sale.openingQuantity -
        (sale.closingQuantity || 0) +
        (sale.addedQuantity || 0);
      const revenue = new Prisma.Decimal(soldQty).times(
        sale.product.sellingPrice,
      );
      totalRevenue = totalRevenue.plus(revenue);

      const costHistory = await this.prisma.productCostHistory.findFirst({
        where: { productId: sale.productId },
        orderBy: { effectiveAt: 'desc' },
      });
      const costPrice = costHistory
        ? new Prisma.Decimal(costHistory.costPrice)
        : new Prisma.Decimal(0);
      totalCost = totalCost.plus(new Prisma.Decimal(soldQty).times(costPrice));
    }

    const expWhere: any = { branch: { businessId } };
    if (branchId) expWhere.branchId = branchId;
    if (startDate || endDate) {
      expWhere.createdAt = {};
      if (startDate) expWhere.createdAt.gte = new Date(startDate);
      if (endDate) expWhere.createdAt.lte = new Date(endDate);
    }
    const expenses = await this.prisma.expense.findMany({ where: expWhere });
    const totalExpenses = expenses.reduce(
      (sum, e) => sum.plus(new Prisma.Decimal(e.amount)),
      new Prisma.Decimal(0),
    );

    const netProfit = totalRevenue.minus(totalCost).minus(totalExpenses);

    return {
      totalRevenue: totalRevenue.toNumber(),
      totalCost: totalCost.toNumber(),
      totalExpenses: totalExpenses.toNumber(),
      netProfit: netProfit.toNumber(),
      generatedAt: new Date(),
    };
  }

  async getSummary(businessId: string, filters: ReportFilterDto) {
    await this.validateOwnership(businessId, filters);
    const { branchId, startDate, endDate } = filters;

    const salesWhere: any = { product: { businessId } };
    if (branchId) salesWhere.shift = { branchId };
    if (startDate || endDate) {
      salesWhere.createdAt = {};
      if (startDate) salesWhere.createdAt.gte = new Date(startDate);
      if (endDate) salesWhere.createdAt.lte = new Date(endDate);
    }
    const sales = await this.prisma.shiftStockItem.findMany({
      where: salesWhere,
      include: { product: true },
    });

    let totalRevenue = new Prisma.Decimal(0);
    let totalCost = new Prisma.Decimal(0);
    let totalUnitsSold = 0;

    for (const sale of sales) {
      const soldQty =
        sale.openingQuantity -
        (sale.closingQuantity || 0) +
        (sale.addedQuantity || 0);
      totalUnitsSold += soldQty;
      totalRevenue = totalRevenue.plus(
        new Prisma.Decimal(soldQty).times(sale.product.sellingPrice),
      );

      const costHistory = await this.prisma.productCostHistory.findFirst({
        where: { productId: sale.productId },
        orderBy: { effectiveAt: 'desc' },
      });
      const costPrice = costHistory
        ? new Prisma.Decimal(costHistory.costPrice)
        : new Prisma.Decimal(0);
      totalCost = totalCost.plus(new Prisma.Decimal(soldQty).times(costPrice));
    }

    const expWhere: any = { branch: { businessId } };
    if (branchId) expWhere.branchId = branchId;
    if (startDate || endDate) {
      expWhere.createdAt = {};
      if (startDate) expWhere.createdAt.gte = new Date(startDate);
      if (endDate) expWhere.createdAt.lte = new Date(endDate);
    }
    const expenses = await this.prisma.expense.findMany({ where: expWhere });
    const totalExpenses = expenses.reduce(
      (sum, e) => sum.plus(new Prisma.Decimal(e.amount)),
      new Prisma.Decimal(0),
    );

    const mpesaWhere: any = { businessId };
    if (startDate || endDate) {
      mpesaWhere.transactionTime = {};
      if (startDate) mpesaWhere.transactionTime.gte = new Date(startDate);
      if (endDate) mpesaWhere.transactionTime.lte = new Date(endDate);
    }
    const mpesaTransactions = await this.prisma.mpesaTransaction.findMany({
      where: mpesaWhere,
    });
    const totalMpesaReceived = mpesaTransactions.reduce(
      (sum, t) => sum.plus(t.amount),
      new Prisma.Decimal(0),
    );

    const discWhere: any = { businessId };
    if (branchId) discWhere.branchId = branchId;
    if (startDate || endDate) {
      discWhere.createdAt = {};
      if (startDate) discWhere.createdAt.gte = new Date(startDate);
      if (endDate) discWhere.createdAt.lte = new Date(endDate);
    }
    const discrepancies = await this.prisma.discrepancy.findMany({
      where: discWhere,
    });
    const openDiscrepancies = discrepancies.filter(
      (d) => d.status === 'OPEN',
    ).length;

    const shiftWhere: any = { branch: { businessId } };
    if (branchId) shiftWhere.branchId = branchId;
    if (startDate || endDate) {
      shiftWhere.openedAt = {};
      if (startDate) shiftWhere.openedAt.gte = new Date(startDate);
      if (endDate) shiftWhere.openedAt.lte = new Date(endDate);
    }
    const activeShifts = await this.prisma.shift.count({
      where: { ...shiftWhere, closedAt: null },
    });

    const netProfit = totalRevenue.minus(totalCost).minus(totalExpenses);

    return {
      revenue: totalRevenue.toNumber(),
      expenses: totalExpenses.toNumber(),
      net: netProfit.toNumber(),
      totalRevenue: totalRevenue.toNumber(),
      totalCost: totalCost.toNumber(),
      totalExpenses: totalExpenses.toNumber(),
      netProfit: netProfit.toNumber(),
      totalUnitsSold,
      totalMpesaReceived: totalMpesaReceived.toNumber(),
      openDiscrepancies,
      totalDiscrepancies: discrepancies.length,
      activeShifts,
      generatedAt: new Date(),
    };
  }

  async getShiftReport(businessId: string, filters: ReportFilterDto): Promise<any> {
    await this.validateOwnership(businessId, filters);
    const { branchId, shiftId } = filters;
    const where: any = { branch: { businessId } };
    if (branchId) where.branchId = branchId;
    if (shiftId) where.id = shiftId;

    const shifts = await this.prisma.shift.findMany({
      where,
      include: {
        shiftStockItems: { include: { product: true } },
        mpesaTransactions: true,
      },
    });

    return { shifts, generatedAt: new Date() };
  }
}
