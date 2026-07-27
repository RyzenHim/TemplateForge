import { Module } from '@nestjs/common';
import { UploadsModule } from '../uploads/uploads.module';
import { MongooseModule } from '@nestjs/mongoose';

import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';

import { App, AppSchema } from './schemas/app.schema';
import {
  Template,
  TemplateSchema,
} from '../templates/schemas/template.schema';

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
    ]),
    UploadsModule,
  ],
  controllers: [AppsController],
  providers: [AppsService],
})
export class AppsModule {}
