import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformPrice, PlatformPriceSchema } from './schemas/platform-price.schema';
import { PlatformPricesController } from './platform-prices.controller';
import { PlatformPricesService } from './platform-prices.service';
@Module({ imports: [MongooseModule.forFeature([{ name: PlatformPrice.name, schema: PlatformPriceSchema }])], controllers: [PlatformPricesController], providers: [PlatformPricesService], exports: [PlatformPricesService] })
export class PlatformPricesModule {}
