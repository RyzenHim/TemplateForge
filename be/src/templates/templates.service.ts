import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Template, TemplateDocument } from './schemas/template.schema';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { CloudinaryService } from '../uploads/cloudinary/cloudinary.service';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name)
    private readonly templateModel: Model<TemplateDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private mapTemplate(template: TemplateDocument) {
    return {
      id: template._id.toString(),
      name: template.name,
      description: template.description,
      visibility: template.visibility,
      thumbnail: template.thumbnail,
      category: template.category,
      tags: template.tags,
      owner: template.owner?.toString() || '',
      branding: template.branding,
      splashScreen: template.splashScreen,
      appPermissions: template.appPermissions,
      appSettings: template.appSettings,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  async create(
    ownerId: string,
    createTemplateDto: CreateTemplateDto,
    files?: {
      thumbnail?: Express.Multer.File[];
      splashImage?: Express.Multer.File[];
    },
  ) {
    const dto = { ...createTemplateDto };

    // Upload thumbnail if provided
    if (files?.thumbnail?.[0]) {
      const result = await this.cloudinaryService.uploadImage(
        files.thumbnail[0],
      );
      console.log('result after uploading the image', result);

      dto.thumbnail = result.secure_url;
    }

    // Upload splash image if provided (only ONE file based on splash type)
    if (files?.splashImage?.[0]) {
      const result = await this.cloudinaryService.uploadImage(
        files.splashImage[0],
      );
      const splashType = dto.splashScreen?.type;

      if (splashType === 'image') {
        dto.splashScreen.fullImage = result.secure_url;
      } else if (splashType === 'animation') {
        dto.splashScreen.animationJson = result.secure_url;
      } else {
        // Default: 'logo' type
        dto.splashScreen.logoImage = result.secure_url;
      }
    }

    const template = await this.templateModel.create({
      ...dto,
      owner: new Types.ObjectId(ownerId),
    });

    return {
      message: 'Template created successfully',
      template: this.mapTemplate(template),
    };
  }

  async findMyTemplates(ownerId: string) {
    const templates = await this.templateModel.find({
      owner: new Types.ObjectId(ownerId),
    });

    return templates.map((template) => this.mapTemplate(template));
  }

  async findPublicTemplates() {
    const templates = await this.templateModel.find({
      visibility: 'public',
    });

    return templates.map((template) => this.mapTemplate(template));
  }

  async findOne(templateId: string) {
    const template = await this.templateModel.findById(templateId);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.mapTemplate(template);
  }

  async update(
    templateId: string,
    ownerId: string,
    updateTemplateDto: UpdateTemplateDto,
  ) {
    const template = await this.templateModel.findOneAndUpdate(
      {
        _id: templateId,
        owner: new Types.ObjectId(ownerId),
      },
      updateTemplateDto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return {
      message: 'Template updated successfully',
      template: this.mapTemplate(template),
    };
  }

  async remove(templateId: string, ownerId: string) {
    const result = await this.templateModel.deleteOne({
      _id: templateId,
      owner: new Types.ObjectId(ownerId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Template not found');
    }

    return {
      message: 'Template deleted successfully',
    };
  }
}
