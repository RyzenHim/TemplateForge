import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import type { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.paymentService.findAll(req.user.id);
  }

  @Post('create-order') async createOrder(
    @Body() dto: CreateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    console.log('REQ USER:', req.user);
    console.log('DTO:', dto);
    return this.paymentService.createOrder(dto, req.user.id);
  }

  @Post('verify')
  verifyPayemnt(
    @Body() dto: VerifyPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentService.verifyPayment(dto, req.user.id);
  }
}
