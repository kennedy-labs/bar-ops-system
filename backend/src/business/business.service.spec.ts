import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BusinessService } from './business.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BusinessService', () => {
  let service: BusinessService;
  let prisma: {
    business: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  const mockBusiness = {
    id: 'business-1',
    name: 'Test Bar',
    phone: null,
    email: null,
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      business: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('should return all businesses', async () => {
      prisma.business.findMany.mockResolvedValue([mockBusiness]);

      const result = await service.getAll();

      expect(result).toEqual([mockBusiness]);
      expect(prisma.business.findMany).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return a business by id', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);

      const result = await service.getById('business-1');

      expect(result).toEqual(mockBusiness);
      expect(prisma.business.findUnique).toHaveBeenCalledWith({
        where: { id: 'business-1' },
      });
    });

    it('should throw NotFoundException when business does not exist', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(service.getById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a business', async () => {
      const createDto = {
        name: 'New Bar',
        currency: 'KES',
        timezone: 'Africa/Nairobi',
      };
      prisma.business.create.mockResolvedValue({
        ...mockBusiness,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(result).toEqual({ ...mockBusiness, ...createDto });
      expect(prisma.business.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('update', () => {
    it('should update business information', async () => {
      const updateDto = { name: 'Updated Bar' };
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      prisma.business.update.mockResolvedValue({
        ...mockBusiness,
        ...updateDto,
      });

      const result = await service.update('business-1', updateDto);

      expect(result).toEqual({ ...mockBusiness, ...updateDto });
      expect(prisma.business.update).toHaveBeenCalledWith({
        where: { id: 'business-1' },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when business does not exist', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a business', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      prisma.business.delete.mockResolvedValue(mockBusiness);

      const result = await service.remove('business-1');

      expect(result).toEqual(mockBusiness);
      expect(prisma.business.delete).toHaveBeenCalledWith({
        where: { id: 'business-1' },
      });
    });

    it('should throw NotFoundException when business does not exist', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when business has dependent data', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      prisma.business.delete.mockRejectedValue(new Error('FK constraint'));

      await expect(service.remove('business-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
