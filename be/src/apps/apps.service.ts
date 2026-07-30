import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { App, AppDocument, AppStatus } from './schemas/app.schema';
import { Addon, AddonDocument } from '../addons/schemas/addon.schema';
import { PlatformPrice, PlatformPriceDocument } from '../platform-prices/schemas/platform-price.schema';
import { CreateAppDto } from './dto/create-app.dto';
import { UpdateAppDto } from './dto/update-app.dto';

import { CloudinaryService } from '../uploads/cloudinary/cloudinary.service';

@Injectable()
export class AppsService {
  constructor(
    @InjectModel(App.name)
    private readonly appModel: Model<AppDocument>,
    @InjectModel(Addon.name)
    private readonly addonModel: Model<AddonDocument>,
    @InjectModel(PlatformPrice.name)
    private readonly platformPriceModel: Model<PlatformPriceDocument>,
    private readonly cloudinaryService: CloudinaryService,
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
      thumbnail: app.thumbnail,
      platform: app.platform,
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
      addons: app.addons || [],
      basePrice: app.basePrice || 0,
      totalPrice: app.totalPrice || 0,
      paidAddonIds: app.paidAddonIds || [],
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }

  private async getBasePrice(
    platform: 'Android' | 'iOS' | 'Android & iOS',
    userId: string,
  ): Promise<number> {
    const price = await this.platformPriceModel.findOne({
      owner: new Types.ObjectId(userId),
      platform,
    });
    if (!price) {
      throw new BadRequestException(
        `Set a price for ${platform} in Platform Pricing before creating an app`,
      );
    }
    return price.price;
  }

  private async createAddonSnapshots(addons: { addonId: string }[] = []) {
    const uniqueIds = [...new Set(addons.map((addon) => addon.addonId))];
    if (!uniqueIds.length) return [];

    const records = await this.addonModel.find({ _id: { $in: uniqueIds } });
    if (records.length !== uniqueIds.length) {
      throw new BadRequestException('One or more selected add-ons no longer exist');
    }

    const byId = new Map(records.map((addon) => [addon._id.toString(), addon]));
    return uniqueIds.map((id) => {
      const addon = byId.get(id)!;
      return {
        addonId: addon._id,
        name: addon.name,
        description: addon.description,
        icon: addon.icon,
        category: addon.category,
        platform: addon.platform,
        pricingType: addon.pricingType,
        price: addon.price,
      };
    });
  }

  async create(
    createAppDto: CreateAppDto,
    userId: string,
    files?: {
      icon?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      splashImage?: Express.Multer.File[];
    },
  ) {
    const { templateId, ...appData } = createAppDto;
    const addonSnapshots = await this.createAddonSnapshots(appData.addons);

    if (files?.icon?.[0]) {
      const result = await this.cloudinaryService.uploadImage(files.icon[0]);
      appData.icon = result.secure_url;
    }

    if (files?.thumbnail?.[0]) {
      const result = await this.cloudinaryService.uploadImage(
        files.thumbnail[0],
      );
      appData.thumbnail = result.secure_url;
    }

    if (files?.splashImage?.[0]) {
      const result = await this.cloudinaryService.uploadImage(
        files.splashImage[0],
      );
      const splashType = appData.splashScreen?.type || 'logo';
      if (splashType === 'image') {
        if (!appData.splashScreen) appData.splashScreen = {} as any;
        appData.splashScreen!.fullImage = result.secure_url;
      } else if (splashType === 'animation') {
        if (!appData.splashScreen) appData.splashScreen = {} as any;
        appData.splashScreen!.animationJson = result.secure_url;
      } else {
        if (!appData.splashScreen) appData.splashScreen = {} as any;
        appData.splashScreen!.logoImage = result.secure_url;
      }
    }

    let app: AppDocument;
    try {
      app = await this.appModel.create({
      ...appData,
      addons: addonSnapshots,
      basePrice: await this.getBasePrice(
        appData.platform as 'Android' | 'iOS' | 'Android & iOS',
        userId,
      ),
      totalPrice: 0,
        owner: new Types.ObjectId(userId),
        sourceTemplate: templateId ? new Types.ObjectId(templateId) : null,
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

  async update(
    id: string,
    userId: string,
    updateAppDto: UpdateAppDto,
    files?: {
      icon?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      splashImage?: Express.Multer.File[];
    },
  ) {
    const dto: any = { ...updateAppDto };

    if (dto.addons) {
      dto.addons = await this.createAddonSnapshots(dto.addons);
    }

    if (files?.icon?.[0]) {
      const result = await this.cloudinaryService.uploadImage(files.icon[0]);
      dto.icon = result.secure_url;
    }

    if (files?.thumbnail?.[0]) {
      const result = await this.cloudinaryService.uploadImage(
        files.thumbnail[0],
      );
      dto.thumbnail = result.secure_url;
    }

    if (files?.splashImage?.[0]) {
      const result = await this.cloudinaryService.uploadImage(
        files.splashImage[0],
      );
      const splashType = dto.splashScreen?.type || 'logo';
      if (splashType === 'image') {
        if (!dto.splashScreen) dto.splashScreen = {} as any;
        dto.splashScreen!.fullImage = result.secure_url;
      } else if (splashType === 'animation') {
        if (!dto.splashScreen) dto.splashScreen = {} as any;
        dto.splashScreen!.animationJson = result.secure_url;
      } else {
        if (!dto.splashScreen) dto.splashScreen = {} as any;
        dto.splashScreen!.logoImage = result.secure_url;
      }
    }

    let app: AppDocument | null;
    try {
      const existingApp = await this.findDocumentByIdAndOwner(id, userId);
      if (dto.platform && existingApp.status === AppStatus.DRAFT) {
        dto.basePrice = await this.getBasePrice(
          dto.platform as 'Android' | 'iOS' | 'Android & iOS',
          userId,
        );
      }
      app = await this.appModel
        .findOneAndUpdate(
          {
            _id: id,
            owner: new Types.ObjectId(userId),
          },
          dto,
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

  async findDocumentByIdAndOwner(
    appId: string,
    userId: string,
  ): Promise<AppDocument> {
    const app = await this.appModel.findOne({
      _id: appId,
      owner: new Types.ObjectId(userId),
    });

    if (!app) {
      throw new NotFoundException('App not found');
    }

    return app;
  }

  async publishApp(appId: string, userId: string) {
    const app = await this.findDocumentByIdAndOwner(appId, userId);

    if (app.status !== AppStatus.PURCHASED) {
      throw new BadRequestException('Only purchased apps can be published');
    }

    app.status = AppStatus.PUBLISHED;

    await app.save();

    return {
      success: true,
      message: 'App published successfully',
    };
  }
}
