import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// --------------------
// Branding
// --------------------

export class BrandingDto {
  @IsString()
  primaryColor!: string;
}

// --------------------
// Splash Screen
// --------------------

export class SplashScreenDto {
  @IsEnum(['animation', 'logo', 'image'])
  type!: 'animation' | 'logo' | 'image';

  @IsString()
  animationJson!: string;

  @IsString()
  logoImage!: string;

  @IsString()
  fullImage!: string;

  @IsString()
  backgroundColor!: string;

  @IsEnum(['once', 'loop'])
  playbackBehaviour!: 'once' | 'loop';
}

// --------------------
// Permissions
// --------------------

export class AppPermissionsDto {
  @IsBoolean()
  camera!: boolean;

  @IsBoolean()
  microphone!: boolean;

  @IsBoolean()
  location!: boolean;

  @IsBoolean()
  storage!: boolean;

  @IsBoolean()
  notifications!: boolean;
}

// --------------------
// App Settings
// --------------------

export class AppSettingsDto {
  @IsString()
  statusBarColor!: string;

  @IsEnum(['portrait', 'landscape', 'both'])
  orientation!: 'portrait' | 'landscape' | 'both';

  @IsBoolean()
  fullScreen!: boolean;

  @IsString()
  systemNavigationBarColor!: string;

  @IsBoolean()
  pinchToZoom!: boolean;

  @IsBoolean()
  callbackOnResume!: boolean;

  @IsBoolean()
  disableCaching!: boolean;

  @IsBoolean()
  kioskMode!: boolean;

  @IsBoolean()
  disableScrollBounce!: boolean;
}
