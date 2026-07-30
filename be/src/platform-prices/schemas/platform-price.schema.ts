import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PlatformPriceDocument = HydratedDocument<PlatformPrice>;

@Schema({ timestamps: true })
export class PlatformPrice {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ enum: ['Android', 'iOS', 'Android & iOS'], required: true })
  platform!: 'Android' | 'iOS' | 'Android & iOS';

  // Paise, never a floating-point INR value.
  @Prop({ required: true, min: 0 })
  price!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PlatformPriceSchema = SchemaFactory.createForClass(PlatformPrice);
PlatformPriceSchema.index({ owner: 1, platform: 1 }, { unique: true });
