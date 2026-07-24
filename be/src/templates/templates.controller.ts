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
import { Request } from 'express';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TemplatesService } from './templates.service';
import { UpdateTemplateDto } from './dto/update-template.dto';
import type { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { memoryStorage } from 'multer';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templateService: TemplatesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'splashImage', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  create(
    @Req() req: AuthenticatedRequest,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      splashImage?: Express.Multer.File[];
    },
    @Body() body: Record<string, any>,
  ) {
    // Parse nested JSON string fields from multipart form
    const parsedBody: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if (
        key === 'branding' ||
        key === 'splashScreen' ||
        key === 'appPermissions' ||
        key === 'appSettings' ||
        key === 'tags'
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

    const createTemplateDto = parsedBody as unknown as CreateTemplateDto;

    return this.templateService.create(req.user.id, createTemplateDto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyTemplates(@Req() req: AuthenticatedRequest) {
    return this.templateService.findMyTemplates(req.user.id);
  }

  @Get('public')
  findPublicTemplates() {
    return this.templateService.findPublicTemplates();
  }

  @Get(':id')
  findOnee(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.templateService.update(id, req.user.id, updateTemplateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.templateService.remove(id, req.user.id);
  }
}
