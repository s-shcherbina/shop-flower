import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagesService } from '../images/images.service';
import { CreateGroupDTO } from './dto';
import { GroupEntity } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupsRepository: Repository<GroupEntity>,
    private readonly imagesService: ImagesService,
  ) {}

  async createGroup(dto: CreateGroupDTO) {
    const existGroup = await this.groupsRepository.findOneBy({
      name: dto.name,
    });
    if (existGroup) throw new BadRequestException('Така група вже існує');
    await this.groupsRepository.save({ ...dto });
  }

  async getGroups(): Promise<GroupEntity[]> {
    const groups = await this.groupsRepository.find();
    return groups;
  }

  async getGroup(id: number): Promise<GroupEntity> {
    const group = await this.groupsRepository.findOneBy({ id });
    return group;
  }

  async removeGroup(id: number): Promise<string> {
    await this.imagesService.removeImgFilesOfGroup(id);
    await this.groupsRepository.delete({ id });
    return 'Видалено';
  }
}
