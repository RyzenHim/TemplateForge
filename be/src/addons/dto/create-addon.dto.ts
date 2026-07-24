import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddonDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  category!: string;

  @IsEnum(['Android', 'iOS', 'Android & iOS'])
  platform!: 'Android' | 'iOS' | 'Android & iOS';
}
