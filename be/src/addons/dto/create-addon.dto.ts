import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

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

  @IsEnum(['free', 'paid'])
  pricingType!: 'free' | 'paid';

  @ValidateIf((dto: CreateAddonDto) => dto.pricingType === 'paid')
  @IsInt()
  @Min(1)
  price?: number;
}
