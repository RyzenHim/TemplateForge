import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(private readonly configService: ConfigService) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID')!,
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET')!,
    });
  }

  async createOrder(dto: CreateOrderDto) {
    console.log('create order dto', dto);
    const order = await this.razorpay.orders.create({
      amount: 50000,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  }
}
