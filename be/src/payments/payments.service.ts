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
  //helper function
  private getBasePrice(platform: string): number {
    switch (platform) {
      case 'Android':
        return 49900;

      case 'iOS':
        return 79900;

      case 'Android & iOS':
        return 99900;

      default:
        throw new BadRequestException('Invalid platform');
    }
  }

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

  async createOrder(dto: CreateOrderDto, userId: string) {
    // console.log('create order dto', dto);

    const app = await this.appsService.findDocumentByIdAndOwner(
      dto.appId,
      userId,
    );

    console.log('Platform:', app.platform);
    console.log('Platform JSON:', JSON.stringify(app.platform));
    if (app.status !== AppStatus.DRAFT) {
      throw new BadRequestException('Only draft apps can be purchased');
    }
    const amount = this.getBasePrice(app.platform);

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
    });
    return {
      key: this.configService.get<string>('RAZORPAY_KEY_ID'),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      appName: app.name,
      description: app.description,
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

    app.status = AppStatus.PURCHASED;

    await app.save();

    return {
      success: true,
      message: 'Payment verified successfully',
    };
  }
}
