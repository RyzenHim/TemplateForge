import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Template, TemplateDocument } from './schemas/template.schema';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectModel(Template.name)
    private readonly templateModel: Model<TemplateDocument>,
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
      owner: template.owner,
      branding: template.branding,
      splashScreen: template.splashScreen,
      appPermissions: template.appPermissions,
      appSettings: template.appSettings,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  async create(ownerId: string, createTemplateDto: CreateTemplateDto) {
    const template = await this.templateModel.create({
      ...createTemplateDto,
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
