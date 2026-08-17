import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { DiscrepanciesService } from './discrepancies.service';
import { CreateDiscrepancyDto } from './dto/create-discrepancy.dto';
import { ResolveDiscrepancyDto } from './dto/resolve-discrepancy.dto';

@Controller('discrepancies')
export class DiscrepanciesController {
  constructor(private readonly discrepanciesService: DiscrepanciesService) {}

  @Get()
  getAll(
    @Query('businessId') businessId: string,
    @Query('branchId') branchId?: string,
    @Query('shiftId') shiftId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    if (!businessId) {
      throw new BadRequestException('businessId is required');
    }
    return this.discrepanciesService.findAll(businessId, {
      branchId,
      shiftId,
      type,
      status,
      from,
      to,
    });
  }

  @Get(':id')
  getById(@Param('id') id: string, @Query('businessId') businessId: string) {
    if (!businessId) {
      throw new BadRequestException('businessId is required');
    }
    return this.discrepanciesService.findOne(id, businessId);
  }

  @Post()
  create(@Body() body: CreateDiscrepancyDto) {
    return this.discrepanciesService.create(body);
  }

  @Post(':id/resolve')
  resolve(
    @Param('id') id: string,
    @Query('businessId') businessId: string,
    @Body() body: ResolveDiscrepancyDto,
  ) {
    if (!businessId) {
      throw new BadRequestException('businessId is required');
    }
    return this.discrepanciesService.resolve(id, businessId, body);
  }
}
