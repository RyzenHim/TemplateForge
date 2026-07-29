import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AppsService } from './apps.service';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@Controller('apps')
@UseGuards(JwtAuthGuard)
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'icon', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
        { name: 'splashImage', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  create(
    @Body() body: Record<string, any>,
    @Req() req: AuthenticatedRequest,
    @UploadedFiles()
    files?: {
      icon?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      splashImage?: Express.Multer.File[];
    },
  ) {
    const parsedBody: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if (
        key === 'branding' ||
        key === 'splashScreen' ||
        key === 'appPermissions' ||
        key === 'appSettings' ||
        key === 'addons'
      ) {
        try {
          parsedBody[key] =
            typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          parsedBody[key] = value;
        }
      } else {
        parsedBody[key] = value;
      }
    }
    const createAppDto = parsedBody as unknown as CreateAppDto;
    return this.appsService.create(createAppDto, req.user.id, files);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.appsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.appsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'icon', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
        { name: 'splashImage', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  update(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @Req() req: AuthenticatedRequest,
    @UploadedFiles()
    files?: {
      icon?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      splashImage?: Express.Multer.File[];
    },
  ) {
    const parsedBody: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if (
        key === 'branding' ||
        key === 'splashScreen' ||
        key === 'appPermissions' ||
        key === 'appSettings' ||
        key === 'addons'
      ) {
        try {
          parsedBody[key] =
            typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          parsedBody[key] = value;
        }
      } else {
        parsedBody[key] = value;
      }
    }
    const updateAppDto = parsedBody as unknown as UpdateAppDto;
    return this.appsService.update(id, req.user.id, updateAppDto, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.appsService.remove(id, req.user.id);
  }

  @Patch(':id/publish')
  publishAppp(@Param('id') appId: string, @Req() req: AuthenticatedRequest) {
    return this.appsService.publishApp(appId, req.user.id);
  }
}
