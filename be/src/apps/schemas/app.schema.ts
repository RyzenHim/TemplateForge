import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AppDocument = HydratedDocument<App>;

@Schema({
  timestamps: true,
})
export class App {
  _id!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    trim: true,
    default: '',
  })
  description!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  packageName!: string;

  @Prop({
    default: '',
  })
  icon!: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  owner!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Template',
    default: null,
  })
  template!: Types.ObjectId | null;

  @Prop({
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  })
  status!: string;

  createdAt!: Date;

  updatedAt!: Date;
}

export const AppSchema = SchemaFactory.createForClass(App);
