import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { CreateOrderDto } from './dto/create-order.dto';
import { AppsService } from 'src/apps/apps.service';
import { AppStatus } from 'src/apps/schemas/app.schema';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import {
  Payment,
  PaymentDocument,
  PaymentGateway,
  PaymentStatus,
} from './schema/payments.schema';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;
  constructor(
    private readonly configService: ConfigService,
    private readonly appsService: AppsService,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID')!,
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET')!,
    });
  }

  async findAll(userId: string) {
    const payments = await this.paymentModel
      .find({ user: userId })
      .populate('app', 'name platform packageName version status')
      .sort({ createdAt: -1 })
      .lean();

    return payments.map((payment) => {
      const app = payment.app as unknown as {
        _id?: { toString(): string };
        name?: string;
        platform?: string;
        packageName?: string;
        version?: string;
        status?: string;
      } | null;

      return {
        id: payment._id.toString(),
        amount: payment.amount,
        currency: payment.currency,
        gateway: payment.gateway,
        status: payment.status,
        gatewayStatus: payment.gatewayStatus || null,
        gatewayOrderId: payment.gatewayOrderId,
        gatewayPaymentId: payment.gatewayPaymentId || null,
        gatewayReceipt: payment.gatewayReceipt || null,
        paymentMethod: payment.paymentMethod || null,
        failureReason: payment.failureReason || null,
        paidAt: payment.paidAt || null,
        refundedAt: payment.refundedAt || null,
        metadata: payment.metadata || {},
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        app: app?._id
          ? {
              id: app._id.toString(),
              name: app.name || 'Deleted app',
              platform: app.platform || null,
              packageName: app.packageName || null,
              version: app.version || null,
              status: app.status || null,
            }
          : null,
      };
    });
  }

  async createOrder(dto: CreateOrderDto, userId: string) {
    // console.log('create order dto', dto);

    const app = await this.appsService.findDocumentByIdAndOwner(
      dto.appId,
      userId,
    );

    if (app.status !== AppStatus.DRAFT && app.status !== AppStatus.PURCHASED) {
      throw new BadRequestException('Only draft or purchased apps can be paid for');
    }

    const paidAddonIds = new Set(app.paidAddonIds || []);
    const chargeableAddons = app.addons.filter(
      (addon) =>
        addon.pricingType === 'paid' &&
        addon.price > 0 &&
        (app.status === AppStatus.DRAFT || !paidAddonIds.has(addon.addonId.toString())),
    );
    const addonAmount = chargeableAddons.reduce(
      (total, addon) => total + addon.price,
      0,
    );
    const baseAmount = app.status === AppStatus.DRAFT ? app.basePrice : 0;
    const amount = baseAmount + addonAmount;

    if (amount <= 0) {
      throw new BadRequestException('There are no new paid items to purchase');
    }

    const order = await this.razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
    // console.log('Logged-in User:', userId);
    // console.log('App Owner:', app.owner);
    await this.paymentModel.create({
      app: app._id,
      user: app.owner,
      amount: Number(order.amount),
      currency: order.currency,
      gateway: PaymentGateway.RAZORPAY,
      gatewayOrderId: order.id,
      gatewayReceipt: order.receipt,
      gatewayStatus: order.status,
      status: PaymentStatus.CREATED,
      metadata: {
        baseAmount,
        addonAmount,
        addonIds: chargeableAddons.map((addon) => addon.addonId.toString()),
        addonItems: chargeableAddons.map((addon) => ({
          id: addon.addonId.toString(),
          name: addon.name,
          price: addon.price,
        })),
      },
    });
    return {
      key: this.configService.get<string>('RAZORPAY_KEY_ID'),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      appName: app.name,
      description: app.description,
      breakdown: {
        baseAmount,
        addonAmount,
        addonItems: chargeableAddons.map((addon) => ({
          name: addon.name,
          price: addon.price,
        })),
        totalAmount: amount,
      },
    };
  }

  async verifyPayment(dto: VerifyPaymentDto, userId: string) {
    const payment = await this.paymentModel.findOne({
      gatewayOrderId: dto.razorpay_order_id,
    });

    if (!payment) {
      throw new BadRequestException('Payment record not found');
    }

    // console.log('Payment User:', payment.user);
    // console.log('JWT User:', userId);

    // console.log('Payment User String:', payment.user.toString());
    // console.log('JWT User String:', userId.toString());

    // console.log('Payment User Type:', typeof payment.user);
    // console.log('JWT User Type:', typeof userId);

    // console.log('Equal:', payment.user.toString() === userId.toString());
    console.log('Before ownership check');
    if (payment.user.toString() !== userId.toString()) {
      throw new ForbiddenException(
        'You are not authorized to verify this payment.',
      );
    }
    console.log('Ownership check passed');
    if (payment.status === PaymentStatus.SUCCESS) {
      return {
        success: true,
        message: 'Payment already verified',
      };
    }
    console.log('Payment User:', payment.user.toString());
    console.log('Logged-in User:', userId);
    const app = await this.appsService.findDocumentByIdAndOwner(
      payment.app.toString(),
      userId,
    );

    const expectedSignature = crypto
      .createHmac(
        'sha256',
        this.configService.getOrThrow('RAZORPAY_KEY_SECRET'),
      )
      .update(`${dto.razorpay_order_id}|${dto.razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== dto.razorpay_signature) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = 'Invalid payment signature';

      await payment.save();

      throw new BadRequestException('Invalid payment signature');
    }

    payment.gatewayPaymentId = dto.razorpay_payment_id;
    payment.gatewaySignature = dto.razorpay_signature;
    payment.gatewayStatus = 'paid';
    payment.status = PaymentStatus.SUCCESS;
    payment.paidAt = new Date();

    await payment.save();

    const metadata = payment.metadata as {
      addonIds?: string[];
    };
    const paidAddonIds = new Set(app.paidAddonIds || []);
    for (const addonId of metadata.addonIds || []) paidAddonIds.add(addonId);
    app.paidAddonIds = [...paidAddonIds];
    app.totalPrice = (app.totalPrice || 0) + payment.amount;
    app.status = AppStatus.PURCHASED;

    await app.save();

    return {
      success: true,
      message: 'Payment verified successfully',
    };
  }
}
