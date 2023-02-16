import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import { Repository } from 'typeorm';
import { GoodsService } from '../goods/goods.service';
import { ImageEntity } from './entities/image.entity';
import * as fs from 'fs';
import { createImageDTO } from './dto';
import { GoodEntity } from '../goods/entities/good.entity';
import { SubGroupsService } from '../sub-groups/sub-groups.service';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,
    @Inject(forwardRef(() => GoodsService))
    private readonly goodsService: GoodsService,
    @Inject(forwardRef(() => SubGroupsService))
    private readonly subGroupsService: SubGroupsService,
  ) {}

  removeImgFile(name: string) {
    if (fs.existsSync(path.resolve(__dirname, '../../..', 'uploads', name)))
      fs.unlinkSync(path.resolve(__dirname, '../../..', 'uploads', name));
  }

  async createImage(file, good: GoodEntity) {
    await this.imageRepository.save({ name: file.filename, good });
  }

  async removeImgsGood(goodId: number) {
    await this.removeImgFilesOfGood(goodId);
  }

  async removeImgsSubgroup(subGroupId: number) {
    await this.removeImgFilesOfSubGroup(subGroupId);
  }

  async uploadImages(dto: createImageDTO, files) {
    const good = await this.goodsService.getGood(dto.goodId);
    if (!good)
      throw new BadRequestException('Немає товару для створення зображень');
    files.forEach((file) => {
      this.createImage(file, good);
    });
  }

  async getImages(goodId: number): Promise<ImageEntity[]> {
    if (!goodId) return this.imageRepository.find();
    const images = await this.imageRepository
      .createQueryBuilder('images')
      .where('images.goodId = :id', { id: goodId })
      .leftJoinAndSelect('images.good', 'good')
      .getMany();
    return images;
  }

  async getImage(id: number): Promise<ImageEntity> {
    const image = await this.imageRepository.findOneBy({ id });
    return image;
  }

  async removeImage(id: number): Promise<string> {
    const image = await this.imageRepository.findOneBy({ id });
    this.removeImgFile(image.name);

    await this.imageRepository.delete({ id });
    return 'Видалено';
  }

  async removeImgFilesOfGood(goodId: number) {
    const images = await this.getImages(goodId);
    if (!images) throw new BadRequestException('Немає фото у цього товару');
    images.forEach((image) => this.removeImgFile(image.name));
  }

  async removeImgFilesOfSubGroup(subGroupId: number) {
    const goods = await this.goodsService.getGoods(subGroupId);
    if (!goods) throw new BadRequestException('Немає товарів у підгрупі');
    goods.forEach((good) => this.removeImgsGood(good.id));
  }

  async removeImgFilesOfGroup(groupId: number) {
    const subGroups = await this.subGroupsService.getSubGroups(groupId);
    if (!subGroups)
      throw new BadRequestException('Немає підгрупи у групі товарів');
    subGroups.forEach((subGroup) => this.removeImgsSubgroup(subGroup.id));
  }
}
