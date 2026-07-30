import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { UpdatePlatformPricesDto } from './dto/update-platform-prices.dto';
import { PlatformPricesService } from './platform-prices.service';

@Controller('platform-prices')
@UseGuards(JwtAuthGuard)
export class PlatformPricesController {
  constructor(private readonly service: PlatformPricesService) {}
  @Get() findAll(@Req() req: AuthenticatedRequest) { return this.service.findAll(req.user.id); }
  @Put() update(@Body() dto: UpdatePlatformPricesDto, @Req() req: AuthenticatedRequest) { return this.service.update(dto, req.user.id); }
}
