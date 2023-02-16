import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';
import { SubGroupsService } from '../sub-groups/sub-groups.service';
import { CreateGoodDTO } from './dto';
import { GoodEntity } from './entities/good.entity';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(GoodEntity)
    private readonly goodRepository: Repository<GoodEntity>,
    @Inject(forwardRef(() => ImagesService))
    private readonly imagesService: ImagesService,
    @Inject(forwardRef(() => SubGroupsService))
    private readonly subGroupsService: SubGroupsService,
  ) {}

  async createGood(dto: CreateGoodDTO): Promise<void> {
    const existGood = await this.goodRepository.findOneBy({
      name: dto.name,
    });
    if (existGood) throw new BadRequestException('Такий товар вже існує');

    const subGroup = await this.subGroupsService.getSubGroup(dto.subGroupId);
    if (!subGroup)
      throw new BadRequestException('Немає підгрупи для створення товару');

    delete dto.subGroupId;
    await this.goodRepository.save({ ...dto, subGroup });
  }

  async getGoods(subGroupId: number): Promise<GoodEntity[]> {
    if (!subGroupId) return this.goodRepository.find();
    const goods = await this.goodRepository
      .createQueryBuilder('goods')
      .where('goods.subGroupId = :id', { id: subGroupId })
      .leftJoinAndSelect('goods.subGroup', 'subGroup')
      .getMany();
    return goods;
  }

  async getGood(id: number): Promise<GoodEntity> {
    const good = await this.goodRepository.findOneBy({ id });
    return good;
  }

  async removeGood(id: number): Promise<string> {
    await this.imagesService.removeImgFilesOfGood(id);
    await this.goodRepository.delete({ id });
    return 'Видалено';
  }
}
