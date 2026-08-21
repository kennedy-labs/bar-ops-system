import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('reports')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Get inventory report' })
  @Get('inventory')
  async getInventoryReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.getInventoryReport(filters);
  }

  @ApiOperation({ summary: 'Get sales report' })
  @Get('sales')
  async getSalesReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.getSalesReport(filters);
  }

  @ApiOperation({ summary: 'Get expense report' })
  @Get('expenses')
  async getExpenseReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.getExpenseReport(filters);
  }

  @ApiOperation({ summary: 'Get profit report' })
  @Get('profit')
  async getProfitReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.getProfitReport(filters);
  }

  @ApiOperation({ summary: 'Get shifts report' })
  @Get('shifts')
  async getShiftReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.getShiftReport(filters);
  }

  @ApiOperation({ summary: 'Get Mpesa report' })
  @Get('mpesa')
  async getMpesaReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.getMpesaReport(filters);
  }

  @ApiOperation({ summary: 'Get discrepancies report' })
  @Get('discrepancies')
  async getDiscrepancyReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.getDiscrepancyReport(filters);
  }

  @ApiOperation({ summary: 'Get business summary report' })
  @Get('summary')
  async getSummaryReport(@Query() filters: ReportFilterDto) {
    return this.reportsService.getSummary(filters);
  }
}
