import { IsMongoId } from 'class-validator';

export class CreateOrderDto {
  @IsMongoId()
  appId!: string;
}
