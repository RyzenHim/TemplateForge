import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsInt, Min, ValidateNested } from 'class-validator';

class PlatformPriceItemDto {
  @IsEnum(['Android', 'iOS', 'Android & iOS'])
  platform!: 'Android' | 'iOS' | 'Android & iOS';

  @IsInt()
  @Min(0)
  price!: number;
}

export class UpdatePlatformPricesDto {
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => PlatformPriceItemDto)
  prices!: PlatformPriceItemDto[];
}
