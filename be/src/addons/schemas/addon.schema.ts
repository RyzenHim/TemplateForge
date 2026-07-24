import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AddonDocument = HydratedDocument<Addon>;

@Schema({
  timestamps: true,
})
export class Addon {
  _id!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  owner!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  name!: string;

  @Prop({
    default: '',
    trim: true,
    maxlength: 500,
  })
  description!: string;

  @Prop({
    default: '',
    trim: true,
  })
  icon!: string;

  @Prop({
    required: true,
    trim: true,
  })
  category!: string;

  @Prop({
    enum: ['Android', 'iOS', 'Android & iOS'],
    required: true,
  })
  platform!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AddonSchema = SchemaFactory.createForClass(Addon);
