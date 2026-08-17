import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DiscrepanciesService } from './discrepancies.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscrepancyDto } from './dto/create-discrepancy.dto';
import { ResolveDiscrepancyDto } from './dto/resolve-discrepancy.dto';

describe('DiscrepanciesService', () => {
  let service: DiscrepanciesService;
  let prisma: any;

  const business = { id: 'biz1', name: 'Business A' };
  const branch = { id: 'branch1', businessId: 'biz1' };
  const shift = { id: 'shift1', branchId: 'branch1' };

  beforeEach(async () => {
    prisma = {
      business: { findUnique: jest.fn() },
      branch: { findUnique: jest.fn() },
      shift: { findUnique: jest.fn() },
      discrepancy: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscrepanciesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<DiscrepanciesService>(DiscrepanciesService);
  });

  it('creates a stock discrepancy and calculates variance correctly', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.branch.findUnique.mockResolvedValue(branch);
    prisma.shift.findUnique.mockResolvedValue(shift);
    prisma.discrepancy.findUnique.mockResolvedValue(null);
    prisma.discrepancy.create.mockResolvedValue({
      id: 'disc1',
      businessId: 'biz1',
      branchId: 'branch1',
      shiftId: 'shift1',
      type: 'STOCK_SHORTAGE',
      status: 'OPEN',
      expectedValue: 50,
      actualValue: 45,
      variance: -5,
      sourceReference: 'stock-recon-1',
      description: 'shortage',
      resolution: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const dto: CreateDiscrepancyDto = {
      businessId: 'biz1',
      branchId: 'branch1',
      shiftId: 'shift1',
      type: 'STOCK_SHORTAGE',
      expectedValue: 50,
      actualValue: 45,
      sourceReference: 'stock-recon-1',
      description: 'shortage',
      resolution: undefined,
    } as any;

    const result = await service.create(dto);

    expect(result).toEqual(
      expect.objectContaining({
        type: 'STOCK_SHORTAGE',
        status: 'OPEN',
        variance: -5,
      }),
    );
    expect(prisma.discrepancy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'STOCK_SHORTAGE',
          status: 'OPEN',
          expectedValue: 50,
          actualValue: 45,
          variance: expect.anything(),
          sourceReference: 'stock-recon-1',
        }),
      }),
    );
  });

  it('rejects zero variance discrepancy creation', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.branch.findUnique.mockResolvedValue(branch);
    prisma.discrepancy.findUnique.mockResolvedValue(null);

    const dto: CreateDiscrepancyDto = {
      businessId: 'biz1',
      branchId: 'branch1',
      type: 'CASH_SHORTAGE',
      expectedValue: 100,
      actualValue: 100,
      sourceReference: 'cash-recon-1',
    } as any;

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('rejects duplicate sourceReference', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.branch.findUnique.mockResolvedValue(branch);
    prisma.discrepancy.findUnique.mockResolvedValue({ id: 'disc1' });

    const dto: CreateDiscrepancyDto = {
      businessId: 'biz1',
      branchId: 'branch1',
      type: 'MPESA_MISMATCH',
      expectedValue: 1000,
      actualValue: 900,
      sourceReference: 'mpesa-recon-1',
    } as any;

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('retrieves discrepancies with business isolation and filters', async () => {
    const expectedRecords = [
      {
        id: 'disc4',
        businessId: 'biz1',
        branchId: 'branch1',
        shiftId: 'shift1',
        type: 'CASH_SHORTAGE',
        status: 'OPEN',
        expectedValue: 100,
        actualValue: 90,
        variance: -10,
        sourceReference: 'cash-recon-2',
      },
    ];
    prisma.discrepancy.findMany.mockResolvedValue(expectedRecords);

    const result = await service.findAll('biz1', {
      branchId: 'branch1',
      shiftId: 'shift1',
      type: 'CASH_SHORTAGE',
      status: 'OPEN',
      from: '2024-01-01T00:00:00.000Z',
      to: '2024-12-31T23:59:59.999Z',
    });

    expect(result).toEqual(expectedRecords);
    expect(prisma.discrepancy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          businessId: 'biz1',
          branchId: 'branch1',
          shiftId: 'shift1',
          type: 'CASH_SHORTAGE',
          status: 'OPEN',
        }),
      }),
    );
  });

  it('finds a single discrepancy by id and business', async () => {
    const record = {
      id: 'disc5',
      businessId: 'biz1',
      branchId: 'branch1',
      type: 'STOCK_SHORTAGE',
      status: 'OPEN',
      expectedValue: 10,
      actualValue: 5,
      variance: -5,
      sourceReference: 'stock-recon-2',
    };
    prisma.discrepancy.findFirst.mockResolvedValue(record);

    const result = await service.findOne('disc5', 'biz1');

    expect(result).toEqual(record);
    expect(prisma.discrepancy.findFirst).toHaveBeenCalledWith({
      where: { id: 'disc5', businessId: 'biz1' },
    });
  });

  it('rejects resolve on non-open discrepancy', async () => {
    prisma.discrepancy.findFirst.mockResolvedValue({
      id: 'disc6',
      businessId: 'biz1',
      status: 'RESOLVED',
    });

    const dto: ResolveDiscrepancyDto = {
      resolution: 'follow-up review',
    } as any;

    await expect(service.resolve('disc6', 'biz1', dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('creates a mpesa discrepancy and calculates negative variance correctly', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.branch.findUnique.mockResolvedValue(branch);
    prisma.shift.findUnique.mockResolvedValue(shift);
    prisma.discrepancy.findUnique.mockResolvedValue(null);
    prisma.discrepancy.create.mockResolvedValue({
      id: 'disc2',
      businessId: 'biz1',
      branchId: 'branch1',
      shiftId: 'shift1',
      type: 'MPESA_MISMATCH',
      status: 'OPEN',
      expectedValue: 10000,
      actualValue: 9500,
      variance: -500,
      sourceReference: 'mpesa-recon-2',
      description: 'mpesa mismatch',
      resolution: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const dto: CreateDiscrepancyDto = {
      businessId: 'biz1',
      branchId: 'branch1',
      shiftId: 'shift1',
      type: 'MPESA_MISMATCH',
      expectedValue: 10000,
      actualValue: 9500,
      sourceReference: 'mpesa-recon-2',
      description: 'mpesa mismatch',
    } as any;

    const result = await service.create(dto);

    expect(result).toEqual(
      expect.objectContaining({
        type: 'MPESA_MISMATCH',
        status: 'OPEN',
        variance: -500,
      }),
    );
    expect(prisma.discrepancy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'MPESA_MISMATCH',
          expectedValue: 10000,
          actualValue: 9500,
          variance: expect.anything(),
          sourceReference: 'mpesa-recon-2',
        }),
      }),
    );
  });

  it('supports a complete discrepancy lifecycle from OPEN to RESOLVED', async () => {
    prisma.business.findUnique.mockResolvedValue(business);
    prisma.branch.findUnique.mockResolvedValue(branch);
    prisma.shift.findUnique.mockResolvedValue(shift);
    prisma.discrepancy.findUnique.mockResolvedValueOnce(null);
    prisma.discrepancy.create.mockResolvedValueOnce({
      id: 'disc3',
      businessId: 'biz1',
      branchId: 'branch1',
      shiftId: 'shift1',
      type: 'MPESA_MISMATCH',
      status: 'OPEN',
      expectedValue: 10000,
      actualValue: 9500,
      variance: -500,
      sourceReference: 'mpesa-recon-3',
      description: 'mpesa lifecycle',
      resolution: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prisma.discrepancy.findFirst.mockResolvedValueOnce({
      id: 'disc3',
      businessId: 'biz1',
      status: 'OPEN',
    });
    prisma.discrepancy.update.mockResolvedValueOnce({
      id: 'disc3',
      status: 'RESOLVED',
      resolution: 'manager reviewed and accepted',
    });

    const createDto: CreateDiscrepancyDto = {
      businessId: 'biz1',
      branchId: 'branch1',
      shiftId: 'shift1',
      type: 'MPESA_MISMATCH',
      expectedValue: 10000,
      actualValue: 9500,
      sourceReference: 'mpesa-recon-3',
      description: 'mpesa lifecycle',
    } as any;

    const created = await service.create(createDto);
    expect(created.status).toBe('OPEN');
    expect(created.type).toBe('MPESA_MISMATCH');

    const resolveDto: ResolveDiscrepancyDto = {
      resolution: 'manager reviewed and accepted',
    } as any;
    const resolved = await service.resolve('disc3', 'biz1', resolveDto);

    expect(resolved).toEqual(
      expect.objectContaining({
        status: 'RESOLVED',
        resolution: 'manager reviewed and accepted',
      }),
    );
    expect(prisma.discrepancy.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'disc3' },
        data: expect.objectContaining({
          status: 'RESOLVED',
          resolution: 'manager reviewed and accepted',
        }),
      }),
    );
  });

  it('resolves an open discrepancy and prevents reopening', async () => {
    prisma.discrepancy.findFirst.mockResolvedValueOnce({
      id: 'disc1',
      businessId: 'biz1',
      status: 'OPEN',
    });
    prisma.discrepancy.update.mockResolvedValue({
      id: 'disc1',
      status: 'RESOLVED',
      resolution: 'investigated',
    });

    const dto: ResolveDiscrepancyDto = {
      resolution: 'investigated',
    } as any;

    const result = await service.resolve('disc1', 'biz1', dto);

    expect(result).toEqual(
      expect.objectContaining({
        status: 'RESOLVED',
        resolution: 'investigated',
      }),
    );
  });
});
