import { IsString } from 'class-validator';
export class CreateOrderDto {
  @IsString({ message: 'Plan ID should be a string.' })
  planId!: string;
}
