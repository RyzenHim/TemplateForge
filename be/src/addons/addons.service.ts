import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Addon, AddonDocument } from './schemas/addon.schema';
import { CreateAddonDto } from './dto/create-addon.dto';
import { UpdateAddonDto } from './dto/update-addon.dto';

@Injectable()
export class AddonsService {
  constructor(
    @InjectModel(Addon.name)
    private readonly addonModel: Model<AddonDocument>,
  ) {}

  private mapAddon(addon: AddonDocument) {
    return {
      id: addon._id.toString(),
      name: addon.name,
      description: addon.description,
      icon: addon.icon,
      category: addon.category,
      platform: addon.platform,
      owner: addon.owner?.toString() || '',
      createdAt: addon.createdAt,
      updatedAt: addon.updatedAt,
    };
  }

  async create(createAddonDto: CreateAddonDto, userId: string) {
    const addon = await this.addonModel.create({
      ...createAddonDto,
      owner: new Types.ObjectId(userId),
    });

    return {
      message: 'Addon created successfully',
      addon: this.mapAddon(addon),
    };
  }

  async findAll(userId: string) {
    const addons = await this.addonModel.find({
      owner: new Types.ObjectId(userId),
    });

    return addons.map((addon) => this.mapAddon(addon));
  }

  async findOne(id: string, userId: string) {
    const addon = await this.addonModel.findOne({
      _id: id,
      owner: new Types.ObjectId(userId),
    });

    if (!addon) {
      throw new NotFoundException('Addon not found');
    }

    return this.mapAddon(addon);
  }

  async update(id: string, updateAddonDto: UpdateAddonDto, userId: string) {
    const addon = await this.addonModel.findOneAndUpdate(
      {
        _id: id,
        owner: new Types.ObjectId(userId),
      },
      updateAddonDto,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!addon) {
      throw new NotFoundException('Addon not found');
    }

    return {
      message: 'Addon updated successfully',
      addon: this.mapAddon(addon),
    };
  }

  async remove(id: string, userId: string) {
    const result = await this.addonModel.deleteOne({
      _id: id,
      owner: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Addon not found');
    }

    return {
      message: 'Addon deleted successfully',
    };
  }
}
