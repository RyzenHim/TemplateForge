import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppsController } from './apps.controller';
import { AppsService } from './apps.service';

import { App, AppSchema } from './schemas/app.schema';
import {
  Template,
  TemplateSchema,
} from 'src/templates/schemas/template.schema';

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
  ],
  controllers: [AppsController],
  providers: [AppsService],
})
export class AppsModule {}
