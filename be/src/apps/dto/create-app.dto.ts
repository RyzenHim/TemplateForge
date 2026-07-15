import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAppDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  packageName!: string;
}
