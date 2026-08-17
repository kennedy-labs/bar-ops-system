import { IsOptional, IsString, IsISO8601, IsUUID } from 'class-validator';

export class ReportFilterDto {
  @IsString()
  @IsUUID()
  businessId: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  shiftId?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;
}
