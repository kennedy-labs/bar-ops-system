import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { AddTransferItemsDto } from './dto/add-transfer-items.dto';
import { DispatchTransferDto } from './dto/dispatch-transfer.dto';
import { ReceiveTransferDto } from './dto/receive-transfer.dto';
import { SetReceiverUserDto } from './dto/set-receiver-user.dto';
import { CancelTransferDto } from './dto/cancel-transfer.dto';
import { RejectTransferDto } from './dto/reject-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertUserInBusiness(userId: string, businessId: string) {
    const membership = await this.prisma.userBusiness.findFirst({
      where: { userId, businessId },
    });
    if (!membership) {
      throw new BadRequestException(
        `User ${userId} does not belong to business ${businessId}`,
      );
    }
  }

  getAll(businessId: string) {
    return this.prisma.transfer.findMany({
      where: { businessId },
      include: {
        items: true,
      },
    });
  }

  getById(id: string, businessId: string) {
    return this.prisma.transfer.findFirst({
      where: { id, businessId },
      include: {
        items: true,
        stockMovements: true,
        discrepancies: true,
        senderUser: true,
        receiverUser: true,
      },
    });
  }

  async create(businessId: string, body: CreateTransferDto) {
    const {
      senderBranchId,
      senderLocationId,
      receiverBranchId,
      receiverLocationId,
      senderUserId,
      receiverUserId,
      notes,
    } = body;

    if (senderBranchId === receiverBranchId && senderLocationId === receiverLocationId) {
      throw new BadRequestException(
        'Sender and receiver locations cannot be the same',
      );
    }

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException(`Business ${businessId} not found`);
    }

    const senderBranch = await this.prisma.branch.findUnique({
      where: { id: senderBranchId },
    });

    if (!senderBranch) {
      throw new NotFoundException(`Branch ${senderBranchId} not found`);
    }

    if (senderBranch.businessId !== businessId) {
      throw new BadRequestException(
        `Sender branch ${senderBranchId} does not belong to business ${businessId}`,
      );
    }

    const receiverBranch = await this.prisma.branch.findUnique({
      where: { id: receiverBranchId },
    });

    if (!receiverBranch) {
      throw new NotFoundException(`Branch ${receiverBranchId} not found`);
    }

    if (receiverBranch.businessId !== businessId) {
      throw new BadRequestException(
        `Receiver branch ${receiverBranchId} does not belong to business ${businessId}`,
      );
    }

    const senderLocation = await this.prisma.stockLocation.findFirst({
      where: { id: senderLocationId, businessId },
    });
    if (!senderLocation) {
      throw new NotFoundException(`Sender location ${senderLocationId} not found for business ${businessId}`);
    }

    const receiverLocation = await this.prisma.stockLocation.findFirst({
      where: { id: receiverLocationId, businessId },
    });
    if (!receiverLocation) {
      throw new NotFoundException(`Receiver location ${receiverLocationId} not found for business ${businessId}`);
    }

    const senderUser = await this.prisma.user.findUnique({
      where: { id: senderUserId },
    });

    if (!senderUser) {
      throw new NotFoundException(`User ${senderUserId} not found`);
    }

    await this.assertUserInBusiness(senderUserId, businessId);

    let receiverUserData: string | undefined = undefined;

    if (receiverUserId) {
      const receiverUser = await this.prisma.user.findUnique({
        where: { id: receiverUserId },
      });

      if (!receiverUser) {
        throw new NotFoundException(`User ${receiverUserId} not found`);
      }

      await this.assertUserInBusiness(receiverUserId, businessId);

      receiverUserData = receiverUserId;
    }

    return this.prisma.transfer.create({
      data: {
        businessId,
        senderBranchId,
        senderLocationId,
        receiverBranchId,
        receiverLocationId,
        senderUserId,
        receiverUserId: receiverUserData,
        notes,
      },
    });
  }

  async addItems(id: string, businessId: string, body: AddTransferItemsDto) {
    const transfer = await this.prisma.transfer.findFirst({
      where: { id, businessId },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer ${id} not found`);
    }

    if (transfer.status !== 'PENDING') {
      throw new ConflictException(
        'Items can only be added to a pending transfer',
      );
    }

    const productIds = [...new Set(body.items.map((item) => item.productId))];
    const productUnitIds = [
      ...new Set(body.items.map((item) => item.productUnitId)),
    ];

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productUnits = await this.prisma.productUnit.findMany({
      where: { id: { in: productUnitIds } },
    });

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );
    const productUnitMap = new Map(productUnits.map((unit) => [unit.id, unit]));

    for (const item of body.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      if (product.businessId !== transfer.businessId) {
        throw new BadRequestException(
          `Product ${item.productId} does not belong to transfer business ${transfer.businessId}`,
        );
      }

      const productUnit = productUnitMap.get(item.productUnitId);
      if (!productUnit) {
        throw new NotFoundException(
          `Product unit ${item.productUnitId} not found`,
        );
      }

      if (productUnit.productId !== item.productId) {
        throw new BadRequestException(
          `Product unit ${item.productUnitId} does not belong to product ${item.productId}`,
        );
      }
    }

    return this.prisma.transferItem.createMany({
      data: body.items.map((item) => ({
        transferId: id,
        productId: item.productId,
        productUnitId: item.productUnitId,
        quantity: item.quantity,
      })),
    });
  }

  async remove(id: string, businessId: string) {
    const transfer = await this.prisma.transfer.findFirst({
      where: { id, businessId },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer ${id} not found`);
    }

    if (transfer.status !== 'PENDING') {
      throw new ConflictException('Only pending transfers can be deleted');
    }

    return this.prisma.transfer.delete({
      where: { id },
    });
  }

  async dispatch(id: string, businessId: string, dto: DispatchTransferDto) {
    const transfer = await this.prisma.transfer.findFirst({
      where: { id, businessId },
      include: {
        items: true,
      },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer ${id} not found`);
    }

    if (transfer.status !== 'PENDING') {
      throw new ConflictException(
        `Transfer must be PENDING. Current: ${transfer.status}`,
      );
    }

    if (dto.userId !== transfer.senderUserId) {
      throw new ConflictException(
        'Only the transfer sender can dispatch this transfer',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new BadRequestException(`User ${dto.userId} not found`);
    }

    await this.assertUserInBusiness(dto.userId, businessId);

    return this.prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            branchId: transfer.senderBranchId,
            productId: item.productId,
            productUnitId: item.productUnitId,
          },
        });

        if (!inventoryItem || inventoryItem.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.productId} (unit ${item.productUnitId}). Available: ${inventoryItem?.quantity ?? 0}, Required: ${item.quantity}`,
          );
        }

        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.stockMovement.createMany({
        data: transfer.items.map((item) => ({
          businessId: transfer.businessId,
          branchId: transfer.senderBranchId,
          productId: item.productId,
          productUnitId: item.productUnitId,
          quantity: item.quantity,
          type: 'TRANSFER_OUT',
          transferId: transfer.id,
        })),
      });

      return tx.transfer.update({
        where: { id },
        data: {
          status: 'SENDER_CONFIRMED',
          dispatchedAt: new Date(),
        },
      });
    });
  }

  async receive(id: string, businessId: string, dto: ReceiveTransferDto) {
    const transfer = await this.prisma.transfer.findFirst({
      where: { id, businessId },
      include: {
        items: true,
      },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer ${id} not found`);
    }

    if (transfer.status !== 'SENDER_CONFIRMED') {
      throw new ConflictException(
        `Transfer must be SENDER_CONFIRMED. Current: ${transfer.status}`,
      );
    }

    if (transfer.receiverUserId && transfer.receiverUserId !== dto.userId) {
      throw new ConflictException(
        'Only the configured receiver can confirm this transfer',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new BadRequestException(`User ${dto.userId} not found`);
    }

    await this.assertUserInBusiness(dto.userId, businessId);

    return this.prisma.$transaction(async (tx) => {
      await tx.stockMovement.createMany({
        data: transfer.items.map((item) => ({
          businessId: transfer.businessId,
          branchId: transfer.receiverBranchId,
          productId: item.productId,
          productUnitId: item.productUnitId,
          quantity: item.quantity,
          type: 'TRANSFER_IN',
          transferId: transfer.id,
        })),
      });

      for (const item of transfer.items) {
        const inventoryItem = await tx.inventoryItem.findFirst({
          where: {
            branchId: transfer.receiverBranchId,
            productId: item.productId,
            productUnitId: item.productUnitId,
          },
        });

        if (inventoryItem) {
          await tx.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });
        } else {
          await tx.inventoryItem.create({
            data: {
              branchId: transfer.receiverBranchId,
              productId: item.productId,
              productUnitId: item.productUnitId,
              quantity: item.quantity,
            },
          });
        }
      }

      return tx.transfer.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          receivedAt: new Date(),
          receiverUserId: dto.userId,
        },
      });
    });
  }

  async setReceiverUser(id: string, businessId: string, dto: SetReceiverUserDto) {
    const transfer = await this.prisma.transfer.findFirst({
      where: { id, businessId },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer ${id} not found`);
    }

    if (transfer.status !== 'PENDING') {
      throw new ConflictException(
        'Receiver can only be assigned while transfer is pending',
      );
    }

    const receiverUser = await this.prisma.user.findUnique({
      where: { id: dto.receiverUserId },
    });

    if (!receiverUser) {
      throw new NotFoundException(`User ${dto.receiverUserId} not found`);
    }

    await this.assertUserInBusiness(dto.receiverUserId, businessId);

    return this.prisma.transfer.update({
      where: { id },
      data: {
        receiverUserId: dto.receiverUserId,
      },
    });
  }

  async cancel(id: string, businessId: string, dto: CancelTransferDto) {
    const transfer = await this.prisma.transfer.findFirst({
      where: { id, businessId },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer ${id} not found`);
    }

    if (transfer.status !== 'PENDING') {
      throw new ConflictException('Only pending transfers can be cancelled');
    }

    if (dto.userId !== transfer.senderUserId) {
      throw new ConflictException(
        'Only the transfer sender can cancel this transfer',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    await this.assertUserInBusiness(dto.userId, businessId);

    return this.prisma.$transaction(async (tx) => {
      await tx.discrepancy.create({
        data: {
          businessId: transfer.businessId,
          branchId: transfer.senderBranchId,
          transferId: id,
          createdById: dto.userId,
          type: 'TRANSFER_MISMATCH',
          status: 'OPEN',
          expectedValue: 0,
          actualValue: 0,
          variance: 0,
          description: dto.notes,
          sourceReference: `transfer-cancel:${id}`,
        },
      });

      return tx.transfer.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
      });
    });
  }

  async reject(id: string, businessId: string, dto: RejectTransferDto) {
    const transfer = await this.prisma.transfer.findFirst({
      where: { id, businessId },
    });

    if (!transfer) {
      throw new NotFoundException(`Transfer ${id} not found`);
    }

    if (transfer.status !== 'SENDER_CONFIRMED') {
      throw new ConflictException('Only confirmed transfers can be rejected');
    }

    if (transfer.receiverUserId && transfer.receiverUserId !== dto.userId) {
      throw new ConflictException(
        'Only the configured receiver can reject this transfer',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found`);
    }

    await this.assertUserInBusiness(dto.userId, businessId);

    return this.prisma.$transaction(async (tx) => {
      await tx.discrepancy.create({
        data: {
          businessId: transfer.businessId,
          branchId: transfer.receiverBranchId,
          transferId: id,
          createdById: dto.userId,
          type: 'TRANSFER_MISMATCH',
          status: 'OPEN',
          expectedValue: 0,
          actualValue: 0,
          variance: 0,
          description: dto.notes,
          sourceReference: `transfer-reject:${id}`,
        },
      });

      return tx.transfer.update({
        where: { id },
        data: {
          status: 'REJECTED',
        },
      });
    });
  }

  getItems(transferId: string, businessId: string) {
    return this.prisma.transferItem.findMany({
      where: { transferId },
    });
  }

  getDiscrepancies(transferId: string, businessId: string) {
    return this.prisma.discrepancy.findMany({
      where: { transferId },
    });
  }

  getStockMovements(transferId: string, businessId: string) {
    return this.prisma.stockMovement.findMany({
      where: { transferId },
    });
  }

  getByBranch(branchId: string, role?: 'SENDER' | 'RECEIVER', businessId?: string) {
    const where: any = {};
    if (businessId) {
      where.businessId = businessId;
    }
    if (role === 'SENDER') {
      where.senderBranchId = branchId;
      return this.prisma.transfer.findMany({ where });
    }

    if (role === 'RECEIVER') {
      where.receiverBranchId = branchId;
      return this.prisma.transfer.findMany({ where });
    }

    where.OR = [{ senderBranchId: branchId }, { receiverBranchId: branchId }];
    return this.prisma.transfer.findMany({ where });
  }
}
