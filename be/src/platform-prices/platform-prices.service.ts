import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PlatformPrice, PlatformPriceDocument } from './schemas/platform-price.schema';
import { UpdatePlatformPricesDto } from './dto/update-platform-prices.dto';

const PLATFORMS = ['Android', 'iOS', 'Android & iOS'] as const;

@Injectable()
export class PlatformPricesService {
  constructor(@InjectModel(PlatformPrice.name) private readonly model: Model<PlatformPriceDocument>) {}

  async findAll(userId: string) {
    const records = await this.model.find({ owner: new Types.ObjectId(userId) });
    const prices = new Map(records.map((record) => [record.platform, record.price]));
    return PLATFORMS.map((platform) => ({ platform, price: prices.get(platform) ?? null }));
  }

  async update(dto: UpdatePlatformPricesDto, userId: string) {
    const platforms = new Set(dto.prices.map((item) => item.platform));
    if (platforms.size !== PLATFORMS.length) throw new BadRequestException('Provide one price for every platform');
    await Promise.all(dto.prices.map((item) => this.model.findOneAndUpdate(
      { owner: new Types.ObjectId(userId), platform: item.platform },
      { owner: new Types.ObjectId(userId), platform: item.platform, price: item.price },
      { upsert: true, new: true, runValidators: true },
    )));
    return this.findAll(userId);
  }

  async getPrice(
    platform: 'Android' | 'iOS' | 'Android & iOS',
    userId: string,
  ) {
    const record = await this.model.findOne({ owner: new Types.ObjectId(userId), platform });
    if (!record) throw new BadRequestException(`Set a price for ${platform} before creating an app`);
    return record.price;
  }
}
