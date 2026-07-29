import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { CreateOrderDto } from './dto/create-order.dto';
import { AppsService } from 'src/apps/apps.service';
import { AppStatus } from 'src/apps/schemas/app.schema';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import * as crypto from 'crypto';
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

      case ' Android & iOS':
        return 99900;

      default:
        throw new BadRequestException('Invalid platform');
    }
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly appsService: AppsService,
  ) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID')!,
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET')!,
    });
  }

  async createOrder(dto: CreateOrderDto, userId: string) {
    console.log('create order dto', dto);

    const app = await this.appsService.findDocumentByIdAndOwner(
      dto.appId,
      userId,
    );
    if (app.status !== AppStatus.DRAFT) {
      throw new BadRequestException('Only draft apps can be purchased');
    }
    const amount = this.getBasePrice(app.platform);

    const order = await this.razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
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
    console.log('Verify Payemnt DTo', dto);
    console.log('User', userId);

    const app = await this.appsService.findDocumentByIdAndOwner(
      dto.appId,
      userId,
    );
    console.log('app', app.name);

    const expectedSignature = crypto
      .createHmac(
        'sha256',
        this.configService.get<string>('RAZORPAY_KEY_SECRET')!,
      )
      .update(`${dto.razorpay_order_id}|${dto.razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== dto.razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    app.status = AppStatus.PURCHASED;

    await app.save();

    return {
      success: true,
      message: 'Payment verified successfully',
    };
  }
}
