import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

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
  @UseInterceptors(FileInterceptor('icon', { storage: memoryStorage() }))
  create(
    @Body() body: Record<string, any>,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const createAddonDto = body as unknown as CreateAddonDto;
    return this.addonsService.create(createAddonDto, req.user.id, file);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.addonsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addonsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('icon', { storage: memoryStorage() }))
  update(
    @Param('id') id: string,
    @Body() body: Record<string, any>,
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const updateAddonDto = body as unknown as UpdateAddonDto;
    return this.addonsService.update(id, updateAddonDto, req.user.id, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.addonsService.remove(id, req.user.id);
  }
}
