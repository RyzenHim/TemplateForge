import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
  BrandingDto,
  SplashScreenDto,
  AppPermissionsDto,
  AppSettingsDto,
} from 'src/common/dto/app-configuration.dto';

export class CreateTemplateDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(['public', 'private'])
  visibility!: 'public' | 'private';

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ValidateNested()
  @Type(() => BrandingDto)
  branding!: BrandingDto;

  @ValidateNested()
  @Type(() => SplashScreenDto)
  splashScreen!: SplashScreenDto;

  @ValidateNested()
  @Type(() => AppPermissionsDto)
  appPermissions!: AppPermissionsDto;

  @ValidateNested()
  @Type(() => AppSettingsDto)
  appSettings!: AppSettingsDto;
}
