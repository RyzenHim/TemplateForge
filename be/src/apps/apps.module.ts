import { Module } from '@nestjs/common';
import { UploadsModule } from '../uploads/uploads.module';
import { MongooseModule } from '@nestjs/mongoose';

import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';

import { App, AppSchema } from './schemas/app.schema';
import { Template, TemplateSchema } from '../templates/schemas/template.schema';
import { Addon, AddonSchema } from '../addons/schemas/addon.schema';
import { PlatformPrice, PlatformPriceSchema } from '../platform-prices/schemas/platform-price.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: App.name,
        schema: AppSchema,
      },
      {
        name: Template.name,
        schema: TemplateSchema,
      },
      { name: Addon.name, schema: AddonSchema },
      { name: PlatformPrice.name, schema: PlatformPriceSchema },
    ]),
    UploadsModule,
  ],
  controllers: [AppsController],
  providers: [AppsService],
  exports: [AppsService],
})
export class AppsModule {}
