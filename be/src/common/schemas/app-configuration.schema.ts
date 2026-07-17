import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Branding {
  @Prop({
    default: '',
    trim: true,
  })
  primaryColor!: string;
}

@Schema({ _id: false })
export class SplashScreen {
  @Prop({
    enum: ['animation', 'logo', 'image'],
    default: 'logo',
  })
  type!: 'animation' | 'logo' | 'image';

  @Prop({
    default: '',
    trim: true,
  })
  animationJson!: string;

  @Prop({
    default: '',
    trim: true,
  })
  logoImage!: string;

  @Prop({
    default: '',
    trim: true,
  })
  fullImage!: string;

  @Prop({
    default: '#ffffff',
    trim: true,
  })
  backgroundColor!: string;

  @Prop({
    enum: ['once', 'loop'],
    default: 'once',
  })
  playbackBehaviour!: 'once' | 'loop';
}

@Schema({ _id: false })
export class AppPermissions {
  @Prop({ default: false })
  camera!: boolean;

  @Prop({ default: false })
  microphone!: boolean;

  @Prop({ default: false })
  location!: boolean;

  @Prop({ default: false })
  storage!: boolean;

  @Prop({ default: false })
  notifications!: boolean;
}

@Schema({ _id: false })
export class AppSettings {
  @Prop({
    default: '#000000',
    trim: true,
  })
  statusBarColor!: string;

  @Prop({
    enum: ['portrait', 'landscape', 'both'],
    default: 'portrait',
  })
  orientation!: 'portrait' | 'landscape' | 'both';

  @Prop({
    default: false,
  })
  fullScreen!: boolean;

  @Prop({
    default: '#ffffff',
    trim: true,
  })
  systemNavigationBarColor!: string;

  @Prop({
    default: false,
  })
  pinchToZoom!: boolean;

  @Prop({
    default: false,
  })
  callbackOnResume!: boolean;

  @Prop({
    default: false,
  })
  disableCaching!: boolean;

  @Prop({
    default: false,
  })
  kioskMode!: boolean;

  @Prop({
    default: false,
  })
  disableScrollBounce!: boolean;
}
