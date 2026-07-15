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
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import { AppsService } from './apps.service';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';

@Controller('apps')
@UseGuards(AuthGuard('jwt'))
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post()
  create(@Body() createAppDto: CreateAppDto, @Req() req: Request) {
    const user = req.user as { id: string };

    return this.appsService.create(createAppDto, user.id);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as { id: string };

    return this.appsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { id: string };

    return this.appsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppDto: UpdateAppDto,
    @Req() req: Request,
  ) {
    const user = req.user as { id: string };

    return this.appsService.update(id, updateAppDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { id: string };

    return this.appsService.remove(id, user.id);
  }
}
