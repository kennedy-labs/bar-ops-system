import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMpesaAccountDto } from './dto/create-mpesa-account.dto';

@Injectable()
export class MpesaAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(businessId: string, body: CreateMpesaAccountDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException(`Business ${businessId} not found`);
    }

    const branch = await this.prisma.branch.findUnique({
      where: { id: body.branchId },
    });

    if (!branch) {
      throw new NotFoundException(`Branch ${body.branchId} not found`);
    }

    if (branch.businessId !== business.id) {
      throw new BadRequestException(
        `Branch ${body.branchId} does not belong to business ${business.id}`,
      );
    }

    const accountIdentifier = this.normalizeAccountIdentifier(
      body.accountIdentifier,
    );

    const existingAccount = await this.prisma.mpesaAccount.findFirst({
      where: {
        businessId,
        accountIdentifier,
      },
    });

    if (existingAccount) {
      throw new ConflictException(
        `Mpesa account ${accountIdentifier} already exists for business ${businessId}`,
      );
    }

    return this.prisma.mpesaAccount.create({
      data: {
        businessId,
        branchId: body.branchId,
        accountIdentifier,
        displayName: body.displayName,
        accountType: body.accountType,
        status: 'ACTIVE',
      },
    });
  }

  async getAll(businessId: string) {
    return this.prisma.mpesaAccount.findMany({
      where: { businessId },
    });
  }

  async getById(id: string, businessId: string) {
    const account = await this.prisma.mpesaAccount.findFirst({
      where: {
        id,
        businessId,
      },
    });

    if (!account) {
      throw new NotFoundException(
        `Mpesa account ${id} not found for business ${businessId}`,
      );
    }

    return account;
  }

  async update(
    id: string,
    businessId: string,
    body: Partial<{ accountIdentifier: string; displayName: string; accountType: string; status: string }>,
  ) {
    const account = await this.prisma.mpesaAccount.findFirst({
      where: { id, businessId },
    });
    if (!account) {
      throw new NotFoundException(
        `Mpesa account ${id} not found for business ${businessId}`,
      );
    }

    const data: any = {};
    if (body.accountIdentifier) {
      const normalized = this.normalizeAccountIdentifier(
        body.accountIdentifier,
      );
      const conflict = await this.prisma.mpesaAccount.findFirst({
        where: { businessId, accountIdentifier: normalized, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(
          `Mpesa account ${normalized} already exists for business ${businessId}`,
        );
      }
      data.accountIdentifier = normalized;
    }

    if (body.displayName) {
      data.displayName = body.displayName;
    }

    if (body.accountType) {
      data.accountType = body.accountType;
    }

    if (body.status) {
      data.status = body.status;
    }

    if (Object.keys(data).length === 0) return account;

    return this.prisma.mpesaAccount.update({ where: { id }, data });
  }

  async deactivate(id: string, businessId: string) {
    const account = await this.prisma.mpesaAccount.findFirst({
      where: { id, businessId },
    });
    if (!account) {
      throw new NotFoundException(
        `Mpesa account ${id} not found for business ${businessId}`,
      );
    }

    if (account.status !== 'ACTIVE') {
      return account;
    }

    return this.prisma.mpesaAccount.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  private normalizeAccountIdentifier(value: string) {
    return value.trim();
  }
}
