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
import { Request } from 'express';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TemplatesService } from './templates.service';
import { UpdateTemplateDto } from './dto/update-template.dto';
import type { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templateService: TemplatesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    return this.templateService.create(req.user.id, createTemplateDto);
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
