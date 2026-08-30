import { Controller, Get, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Get inventory report' })
  @Get('inventory')
  async getInventoryReport(@Headers('x-business-id') businessId: string, @Query() filters: ReportFilterDto) {
    return this.reportsService.getInventoryReport(businessId, filters);
  }

  @ApiOperation({ summary: 'Get sales report' })
  @Get('sales')
  async getSalesReport(@Headers('x-business-id') businessId: string, @Query() filters: ReportFilterDto) {
    return this.reportsService.getSalesReport(businessId, filters);
  }

  @ApiOperation({ summary: 'Get expense report' })
  @Get('expenses')
  async getExpenseReport(@Headers('x-business-id') businessId: string, @Query() filters: ReportFilterDto) {
    return this.reportsService.getExpenseReport(businessId, filters);
  }

  @ApiOperation({ summary: 'Get profit report' })
  @Get('profit')
  async getProfitReport(@Headers('x-business-id') businessId: string, @Query() filters: ReportFilterDto) {
    return this.reportsService.getProfitReport(businessId, filters);
  }

  @ApiOperation({ summary: 'Get shifts report' })
  @Get('shifts')
  async getShiftReport(@Headers('x-business-id') businessId: string, @Query() filters: ReportFilterDto) {
    return this.reportsService.getShiftReport(businessId, filters);
  }

  @ApiOperation({ summary: 'Get Mpesa report' })
  @Get('mpesa')
  async getMpesaReport(@Headers('x-business-id') businessId: string, @Query() filters: ReportFilterDto) {
    return this.reportsService.getMpesaReport(businessId, filters);
  }

  @ApiOperation({ summary: 'Get discrepancies report' })
  @Get('discrepancies')
  async getDiscrepancyReport(@Headers('x-business-id') businessId: string, @Query() filters: ReportFilterDto) {
    return this.reportsService.getDiscrepancyReport(businessId, filters);
  }

  @ApiOperation({ summary: 'Get business summary report' })
  @Get('summary')
  async getSummaryReport(@Headers('x-business-id') businessId: string, @Query() filters: ReportFilterDto) {
    return this.reportsService.getSummary(businessId, filters);
  }
}
