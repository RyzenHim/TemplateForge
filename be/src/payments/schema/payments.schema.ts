import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { App } from '../../apps/schemas/app.schema';
import { User } from '../../users/schemas/user.schema';

export type PaymentDocument = HydratedDocument<Payment>;

export enum PaymentGateway {
  RAZORPAY = 'razorpay',
}

export enum PaymentStatus {
  CREATED = 'created',
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({
    type: Types.ObjectId,
    ref: App.name,
    required: true,
    index: true,
  })
  app!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  user!: Types.ObjectId;

  @Prop({
    required: true,
    min: 0,
  })
  amount!: number;

  @Prop({
    required: true,
    default: 'INR',
  })
  currency!: string;

  @Prop({
    enum: Object.values(PaymentGateway),
    default: PaymentGateway.RAZORPAY,
    required: true,
  })
  gateway!: PaymentGateway;

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  gatewayOrderId!: string;

  @Prop()
  gatewayPaymentId?: string;

  @Prop()
  gatewaySignature?: string;

  @Prop()
  gatewayReceipt?: string;

  @Prop()
  gatewayStatus?: string;

  @Prop({
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.CREATED,
    required: true,
    index: true,
  })
  status!: PaymentStatus;

  @Prop()
  paymentMethod?: string;

  @Prop()
  failureReason?: string;

  @Prop()
  paidAt?: Date;

  @Prop()
  refundedAt?: Date;

  @Prop({
    type: Object,
    default: {},
  })
  metadata!: Record<string, unknown>;

  createdAt!: Date;

  updatedAt!: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
