import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  Branding,
  SplashScreen,
  AppPermissions,
  AppSettings,
} from 'src/common/schemas/app-configuration.schema';

export type TemplateDocument = HydratedDocument<Template>;

@Schema({
  timestamps: true,
})
export class Template {
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
    enum: ['system', 'public', 'private'],
    default: 'private',
  })
  visibility!: 'system' | 'public' | 'private';

  @Prop({
    default: '',
    trim: true,
  })
  thumbnail!: string;

  @Prop({
    default: '',
    trim: true,
  })
  category!: string;

  @Prop({
    type: [String],
    default: [],
  })
  tags!: string[];

  @Prop({
    type: Branding,
    required: true,
  })
  branding!: Branding;

  @Prop({
    type: SplashScreen,
    required: true,
  })
  splashScreen!: SplashScreen;

  @Prop({
    type: AppPermissions,
    required: true,
  })
  appPermissions!: AppPermissions;

  @Prop({
    type: AppSettings,
    required: true,
  })
  appSettings!: AppSettings;

  createdAt!: Date;
  updatedAt!: Date;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
