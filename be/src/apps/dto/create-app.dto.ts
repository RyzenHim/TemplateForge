import { Type } from 'class-transformer';
import {
  IsDefined,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import {
  AppPermissionsDto,
  AppSettingsDto,
  BrandingDto,
  SplashScreenDto,
} from 'src/common/dto/app-configuration.dto';

export class CreateAppDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  packageName!: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  // Selected template (System/Public/Private)
  @IsOptional()
  @IsMongoId()
  templateId?: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => BrandingDto)
  branding!: BrandingDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => SplashScreenDto)
  splashScreen!: SplashScreenDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => AppPermissionsDto)
  appPermissions!: AppPermissionsDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => AppSettingsDto)
  appSettings!: AppSettingsDto;
}
