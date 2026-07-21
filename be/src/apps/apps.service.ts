import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { App, AppDocument } from './schemas/app.schema';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';

@Injectable()
export class AppsService {
  constructor(
    @InjectModel(App.name)
    private readonly appModel: Model<AppDocument>,
  ) {}

  private mapApp(app: any) {
    return {
      id: app._id.toString(),
      name: app.name,
      description: app.description,
      packageName: app.packageName,
      version: app.version,
      websiteUrl: app.websiteUrl,
      icon: app.icon,
      status: app.status,
      owner: app.owner?.toString() || '',
      sourceTemplate: app.sourceTemplate?._id
        ? app.sourceTemplate._id.toString()
        : app.sourceTemplate?.toString() || null,
      templateName: app.sourceTemplate?.name || 'None',
      branding: app.branding,
      splashScreen: app.splashScreen,
      appPermissions: app.appPermissions,
      appSettings: app.appSettings,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }

  async create(createAppDto: CreateAppDto, userId: string) {
    const { templateId, ...appData } = createAppDto;
    let app: AppDocument;
    try {
      app = await this.appModel.create({
        ...appData,
        owner: new Types.ObjectId(userId),
        sourceTemplate: templateId ?? null,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Package name already exists');
      }
      throw error;
    }
    const populatedApp = await app.populate('sourceTemplate');
    return {
      message: 'App created successfully',
      app: this.mapApp(populatedApp),
    };
  }

  async findAll(userId: string) {
    const apps = await this.appModel
      .find({
        owner: new Types.ObjectId(userId),
      })
      .populate('sourceTemplate');
    return apps.map((app) => this.mapApp(app));
  }

  async findOne(id: string, userId: string) {
    const app = await this.appModel
      .findOne({
        _id: id,
        owner: new Types.ObjectId(userId),
      })
      .populate('sourceTemplate');
    if (!app) {
      throw new NotFoundException('App not found');
    }
    return this.mapApp(app);
  }

  async update(id: string, updateAppDto: UpdateAppDto, userId: string) {
    let app: AppDocument | null;
    try {
      app = await this.appModel
        .findOneAndUpdate(
          {
            _id: id,
            owner: new Types.ObjectId(userId),
          },
          updateAppDto,
          {
            new: true,
            runValidators: true,
          },
        )
        .populate('sourceTemplate');
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('Package name already exists');
      }
      throw error;
    }
    if (!app) {
      throw new NotFoundException('App not found');
    }
    return {
      message: 'App updated successfully',
      app: this.mapApp(app),
    };
  }

  async remove(id: string, userId: string) {
    const app = await this.appModel.findOneAndDelete({
      _id: id,
      owner: new Types.ObjectId(userId),
    });
    if (!app) {
      throw new NotFoundException('App not found');
    }
    return {
      message: 'App deleted successfully',
    };
  }
}
