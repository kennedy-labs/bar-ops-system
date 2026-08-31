import { Test, TestingModule } from '@nestjs/testing';
import { TransfersService } from './transfers.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

describe('TransfersService', () => {
  let service: TransfersService;
  let prisma: PrismaService;

  const mockPrisma = {
    business: {
      findUnique: jest.fn(),
    },
    branch: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'branch1', businessId: 'biz1' }),
    },
    user: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ id: 'user1', businessId: 'biz1' }),
    },
    transfer: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn().mockResolvedValue({
        id: 'transfer1',
        businessId: 'biz1',
        status: 'PENDING',
        senderUserId: 'user1',
      }),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    transferItem: {
      createMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
    productUnit: {
      findMany: jest.fn(),
    },
    inventoryItem: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    stockLocation: {
      findFirst: jest
        .fn()
        .mockResolvedValue({ id: 'loc1', businessId: 'biz1' }),
    },
    stockMovement: {
      createMany: jest.fn(),
    },
    userBusiness: {
      findFirst: jest
        .fn()
        .mockResolvedValue({ userId: 'user1', businessId: 'biz1' }),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset default mock resolved values to prevent test pollution
    mockPrisma.branch.findUnique.mockResolvedValue({ id: 'branch1', businessId: 'biz1' });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', businessId: 'biz1' });
    mockPrisma.transfer.findFirst.mockResolvedValue({ id: 'transfer1', businessId: 'biz1', status: 'PENDING', senderUserId: 'user1' });
    mockPrisma.userBusiness.findFirst.mockResolvedValue({ userId: 'user1', businessId: 'biz1' });
    mockPrisma.inventoryItem.findFirst.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransfersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TransfersService>(TransfersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a transfer request successfully', async () => {
      const body = {
        businessId: 'biz1',
        senderBranchId: 'branch1',
        receiverBranchId: 'branch2',
        senderLocationId: 'loc1',
        receiverLocationId: 'loc2',
        senderUserId: 'user1',
        notes: 'Transfer notes',
      };

      mockPrisma.business.findUnique.mockResolvedValue({ id: 'biz1' });
      mockPrisma.branch.findUnique.mockResolvedValueOnce({
        id: 'branch1',
        businessId: 'biz1',
      });
      mockPrisma.branch.findUnique.mockResolvedValueOnce({
        id: 'branch2',
        businessId: 'biz1',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        businessId: 'biz1',
      });
      mockPrisma.transfer.create.mockResolvedValue({
        id: 'transfer1',
        ...body,
        status: 'PENDING',
      });

      const result = await service.create('biz1', body);

      expect(result).toBeDefined();
      expect(result.id).toBe('transfer1');
      expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({
        where: { id: 'biz1' },
      });
      expect(mockPrisma.transfer.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if sender and receiver branches are the same', async () => {
      const body = {
        businessId: 'biz1',
        senderBranchId: 'branch1',
        receiverBranchId: 'branch1',
        senderLocationId: 'loc1',
        receiverLocationId: 'loc2',
        senderUserId: 'user1',
      };

      await expect(service.create('biz1', body)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if business does not exist', async () => {
      const body = {
        businessId: 'biz-invalid',
        senderBranchId: 'branch1',
        receiverBranchId: 'branch2',
        senderLocationId: 'loc1',
        receiverLocationId: 'loc2',
        senderUserId: 'user1',
      };

      mockPrisma.business.findUnique.mockResolvedValue(null);

      await expect(service.create('biz-invalid', body)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addItems', () => {
    it('should add items to pending transfer', async () => {
      const transferId = 'transfer1';
      const body = {
        items: [{ productId: 'prod1', productUnitId: 'unit1', quantity: 10 }],
      };

      mockPrisma.transfer.findFirst.mockResolvedValue({
        id: transferId,
        status: 'PENDING',
        businessId: 'biz1',
      });
      mockPrisma.product.findMany.mockResolvedValue([
        { id: 'prod1', businessId: 'biz1' },
      ]);
      mockPrisma.productUnit.findMany.mockResolvedValue([
        { id: 'unit1', productId: 'prod1' },
      ]);
      mockPrisma.transferItem.createMany.mockResolvedValue({ count: 1 });

      const result = await service.addItems(transferId, 'biz1', body);

      expect(result).toBeDefined();
      expect(mockPrisma.transferItem.createMany).toHaveBeenCalledWith({
        data: [
          {
            transferId,
            productId: 'prod1',
            productUnitId: 'unit1',
            quantity: 10,
          },
        ],
      });
    });

    it('should throw ConflictException if transfer is not PENDING', async () => {
      const transferId = 'transfer1';
      const body = {
        items: [{ productId: 'prod1', productUnitId: 'unit1', quantity: 10 }],
      };

      mockPrisma.transfer.findFirst.mockResolvedValue({
        id: transferId,
        status: 'SENDER_CONFIRMED',
      });

      await expect(service.addItems(transferId, 'biz1', body)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('dispatch', () => {
    it('should successfully dispatch transfer, update inventory, and create stock movements', async () => {
      const transferId = 'transfer1';
      const dto = { userId: 'user1' };
      const transfer = {
        id: transferId,
        businessId: 'biz1',
        senderBranchId: 'branch1',
        receiverBranchId: 'branch2',
        senderLocationId: 'loc1',
        receiverLocationId: 'loc2',
        senderUserId: 'user1',
        status: 'PENDING',
        items: [{ productId: 'prod1', productUnitId: 'unit1', quantity: 5 }],
      };

      mockPrisma.transfer.findFirst.mockResolvedValue(transfer);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        businessId: 'biz1',
      });
      mockPrisma.inventoryItem.findFirst.mockResolvedValue({
        id: 'inv1',
        quantity: 10,
      });
      mockPrisma.transfer.update.mockResolvedValue({
        ...transfer,
        status: 'SENDER_CONFIRMED',
      });

      const result = await service.dispatch(transferId, 'biz1', dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('SENDER_CONFIRMED');

      // Check Inventory update (decrement)
      expect(mockPrisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 'inv1' },
        data: { quantity: { decrement: 5 } },
      });

      // Check StockMovement creation
      expect(mockPrisma.stockMovement.createMany).toHaveBeenCalledWith({
        data: [
          {
            businessId: 'biz1',
            branchId: 'branch1',
            productId: 'prod1',
            productUnitId: 'unit1',
            quantity: 5,
            type: 'TRANSFER_OUT',
            transferId,
          },
        ],
      });
    });

    it('should reject dispatch if the user is not the sender', async () => {
      const transferId = 'transfer1';
      const dto = { userId: 'user2' };
      const transfer = {
        id: transferId,
        businessId: 'biz1',
        senderBranchId: 'branch1',
        receiverBranchId: 'branch2',
        senderLocationId: 'loc1',
        receiverLocationId: 'loc2',
        senderUserId: 'user1',
        status: 'PENDING',
        items: [{ productId: 'prod1', productUnitId: 'unit1', quantity: 5 }],
      };

      mockPrisma.transfer.findFirst.mockResolvedValue(transfer);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user2',
        businessId: 'biz1',
      });

      await expect(service.dispatch(transferId, 'biz1', dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should reject dispatch if inventory has insufficient quantity', async () => {
      const transferId = 'transfer1';
      const dto = { userId: 'user1' };
      const transfer = {
        id: transferId,
        businessId: 'biz1',
        senderBranchId: 'branch1',
        receiverBranchId: 'branch2',
        senderLocationId: 'loc1',
        receiverLocationId: 'loc2',
        senderUserId: 'user1',
        status: 'PENDING',
        items: [{ productId: 'prod1', productUnitId: 'unit1', quantity: 15 }],
      };

      mockPrisma.transfer.findFirst.mockResolvedValue(transfer);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user1',
        businessId: 'biz1',
      });
      mockPrisma.inventoryItem.findFirst.mockResolvedValue({
        id: 'inv1',
        quantity: 10,
      }); // Insufficient! (10 < 15)

      await expect(service.dispatch(transferId, 'biz1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a pending transfer', async () => {
      const transferId = 'transfer1';

      mockPrisma.transfer.findFirst.mockResolvedValue({
        id: transferId,
        status: 'PENDING',
      });
      mockPrisma.transfer.delete.mockResolvedValue({
        id: transferId,
        status: 'PENDING',
      });

      const result = await service.remove(transferId, 'biz1');

      expect(result).toBeDefined();
      expect(mockPrisma.transfer.delete).toHaveBeenCalledWith({
        where: { id: transferId },
      });
    });

    it('should reject deletion of non-pending transfer', async () => {
      const transferId = 'transfer1';

      mockPrisma.transfer.findFirst.mockResolvedValue({
        id: transferId,
        status: 'SENDER_CONFIRMED',
      });

      await expect(service.remove(transferId, 'biz1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('setReceiverUser', () => {
    it('should assign receiver user when transfer is pending', async () => {
      const transferId = 'transfer1';
      const dto = { receiverUserId: 'user2' };

      mockPrisma.transfer.findFirst.mockResolvedValue({
        id: transferId,
        status: 'PENDING',
        businessId: 'biz1',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user2',
        businessId: 'biz1',
      });
      mockPrisma.transfer.update.mockResolvedValue({
        id: transferId,
        status: 'PENDING',
        businessId: 'biz1',
        receiverUserId: 'user2',
      });

      const result = await service.setReceiverUser(transferId, 'biz1', dto);

      expect(result).toBeDefined();
      expect(result.receiverUserId).toBe('user2');
      expect(mockPrisma.transfer.update).toHaveBeenCalledWith({
        where: { id: transferId },
        data: { receiverUserId: 'user2' },
      });
    });

    it('should reject assigning receiver if transfer is not pending', async () => {
      const transferId = 'transfer1';
      const dto = { receiverUserId: 'user2' };

      mockPrisma.transfer.findFirst.mockResolvedValue({
        id: transferId,
        status: 'SENDER_CONFIRMED',
        businessId: 'biz1',
      });

      await expect(
        service.setReceiverUser(transferId, 'biz1', dto),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject receiver assignment when user belongs to another business', async () => {
      const transferId = 'transfer1';
      const dto = { receiverUserId: 'user2' };

      mockPrisma.transfer.findFirst.mockResolvedValue({
        id: transferId,
        status: 'PENDING',
        businessId: 'biz1',
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user2',
        businessId: 'biz2',
      });
      mockPrisma.userBusiness.findFirst.mockResolvedValue(null);

      await expect(
        service.setReceiverUser(transferId, 'biz1', dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('receive', () => {
    it('should successfully receive transfer, update receiver inventory, and create TRANSFER_IN stock movements', async () => {
      const transferId = 'transfer1';
      const dto = { userId: 'user2' }; // Receiver User Accountability
      const transfer = {
        id: transferId,
        businessId: 'biz1',
        senderBranchId: 'branch1',
        receiverBranchId: 'branch2',
        status: 'SENDER_CONFIRMED',
        items: [{ productId: 'prod1', productUnitId: 'unit1', quantity: 5 }],
      };

      mockPrisma.transfer.findFirst.mockResolvedValue(transfer);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user2',
        businessId: 'biz1',
      });
      // Receiver inventory item exists
      mockPrisma.inventoryItem.findFirst.mockResolvedValue({
        id: 'inv2',
        quantity: 3,
      });
      mockPrisma.transfer.update.mockResolvedValue({
        ...transfer,
        status: 'COMPLETED',
        receiverUserId: 'user2',
      });

      const result = await service.receive(transferId, 'biz1', dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('COMPLETED');
      expect(result.receiverUserId).toBe('user2');

      // Check Receiver Inventory update (increment)
      expect(mockPrisma.inventoryItem.update).toHaveBeenCalledWith({
        where: { id: 'inv2' },
        data: { quantity: { increment: 5 } },
      });

      // Check StockMovement creation (TRANSFER_IN)
      expect(mockPrisma.stockMovement.createMany).toHaveBeenCalledWith({
        data: [
          {
            businessId: 'biz1',
            branchId: 'branch2',
            productId: 'prod1',
            productUnitId: 'unit1',
            quantity: 5,
            type: 'TRANSFER_IN',
            transferId,
          },
        ],
      });
    });

    it('should create new InventoryItem if receiver branch does not have one yet', async () => {
      const transferId = 'transfer1';
      const dto = { userId: 'user2' };
      const transfer = {
        id: transferId,
        businessId: 'biz1',
        senderBranchId: 'branch1',
        receiverBranchId: 'branch2',
        status: 'SENDER_CONFIRMED',
        items: [{ productId: 'prod1', productUnitId: 'unit1', quantity: 5 }],
      };

      mockPrisma.transfer.findFirst.mockResolvedValue(transfer);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user2',
        businessId: 'biz1',
      });
      // Receiver inventory item does not exist
      mockPrisma.inventoryItem.findFirst.mockResolvedValue(null);
      mockPrisma.transfer.update.mockResolvedValue({
        ...transfer,
        status: 'COMPLETED',
      });

      await service.receive(transferId, 'biz1', dto);

      // Check Receiver Inventory item created
      expect(mockPrisma.inventoryItem.create).toHaveBeenCalledWith({
        data: {
          branchId: 'branch2',
          productId: 'prod1',
          productUnitId: 'unit1',
          quantity: 5,
        },
      });
    });
  });
});
