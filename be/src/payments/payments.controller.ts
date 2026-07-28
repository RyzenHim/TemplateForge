import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Post('create-order') async createOrder(@Body() dto: CreateOrderDto) {
    return this.paymentService.createOrder(dto);
  }
}
