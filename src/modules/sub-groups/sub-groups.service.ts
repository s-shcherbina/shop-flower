import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupsService } from '../groups/groups.service';
import { ImagesService } from '../images/images.service';
import { CreateSubGroupDTO } from './dto';
import { SubGroupEntity } from './entities/sub-group.entity';

@Injectable()
export class SubGroupsService {
  constructor(
    @InjectRepository(SubGroupEntity)
    private readonly subGroupRepository: Repository<SubGroupEntity>,
    private readonly groupsService: GroupsService,
    @Inject(forwardRef(() => ImagesService))
    private readonly imagesService: ImagesService,
  ) {}

  async createSubGroup(dto: CreateSubGroupDTO) {
    const existSubGroup = await this.subGroupRepository.findOneBy({
      name: dto.name,
    });
    if (existSubGroup) throw new BadRequestException('Така підгрупа вже існує');

    const group = await this.groupsService.getGroup(dto.groupId);
    if (!group)
      throw new BadRequestException('Немає групи для створення підгрупи');

    await this.subGroupRepository.save({
      name: dto.name,
      group,
    });
    // const subGroup = await this.subGroupRepository.findOneBy({
    //   name: dto.name,
    // });
    // return subGroup - Promise<SubGroupEntity>
  }

  async getSubGroups(groupId: number): Promise<SubGroupEntity[]> {
    if (!groupId) return this.subGroupRepository.find();
    const subGroups = await this.subGroupRepository
      .createQueryBuilder('subGroups')
      .where('subGroups.groupId = :id', { id: groupId })
      .leftJoinAndSelect('subGroups.group', 'group')
      .getMany();
    // const group = await this.groupsService.getGroup(groupId);
    // const subGroups = await this.subGroupRepository.find({
    //   where: { group },
    //   relations: { group: true },
    // }); - working!!
    return subGroups;
  }

  async getSubGroup(id: number): Promise<SubGroupEntity> {
    return await this.subGroupRepository.findOneBy({ id });
  }

  async removeSubGroup(id: number): Promise<string> {
    await this.imagesService.removeImgFilesOfSubGroup(id);
    await this.subGroupRepository.delete({ id });
    return 'Видалено';
  }
}
