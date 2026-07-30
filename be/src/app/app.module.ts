import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../users/user.module';
import { AuthModule } from '../auth/auth.module';
import { AppsModule } from '../apps/apps.module';
import { TemplatesModule } from '../templates/templates.module';
import { UploadsModule } from '../uploads/uploads.module';
import { AddonsModule } from '../addons/addons.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { PlatformPricesModule } from '../platform-prices/platform-prices.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    UserModule,
    AuthModule,
    AppsModule,
    TemplatesModule,
    UploadsModule,
    AddonsModule,
    UserModule,
    PaymentsModule,
    PlatformPricesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
