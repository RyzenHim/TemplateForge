import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AddonsController } from './addons.controller';
import { AddonsService } from './addons.service';
import { Addon, AddonSchema } from './schemas/addon.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Addon.name,
        schema: AddonSchema,
      },
    ]),
  ],
  controllers: [AddonsController],
  providers: [AddonsService],
  exports: [AddonsService],
})
export class AddonsModule {}
