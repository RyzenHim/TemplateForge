import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddonsService } from './addons.service';
import { CreateAddonDto } from './dto/create-addon.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('addons')
@UseGuards(JwtAuthGuard)
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @Post()
  create(
    @Body() createAddonDto: CreateAddonDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.addonsService.create(createAddonDto, req.user.id);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.addonsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.addonsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAddonDto: UpdateAddonDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.addonsService.update(id, updateAddonDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.addonsService.remove(id, req.user.id);
  }
}
