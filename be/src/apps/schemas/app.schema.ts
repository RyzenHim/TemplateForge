import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  Branding,
  SplashScreen,
  AppPermissions,
  AppSettings,
  AddonSnapshot,
} from '../../common/schemas/app-configuration.schema';
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
    default: '',
    trim: true,
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
    default: '1.0.0',
  })
  version!: string;

  @Prop({
    default: '',
  })
  websiteUrl!: string;

  @Prop({
    default: '',
  })
  icon!: string;

  @Prop({
    default: '',
  })
  thumbnail!: string;

  @Prop({
    required: true,
    enum: ['Android', 'iOS', 'Android & iOS'],
  })
  platform!: string;

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
  sourceTemplate!: Types.ObjectId | null;

  @Prop({
    enum: ['draft', 'purchased', 'published', 'archived'],
    default: 'draft',
  })
  status!: string;

  // Copied from template when app is created
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

  @Prop({
    type: [AddonSnapshot],
    default: [],
  })
  addons!: AddonSnapshot[];

  createdAt!: Date;

  updatedAt!: Date;
}

export const AppSchema = SchemaFactory.createForClass(App);
