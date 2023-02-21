import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubGroupsService } from '../sub-groups/sub-groups.service';
import { CreateGroupDTO } from './dto';
import { GroupEntity } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    private readonly subgroupsService: SubGroupsService,
  ) {}

  async createGroup(dto: CreateGroupDTO) {
    const existGroup = await this.groupRepository.findOneBy({
      name: dto.name,
    });
    if (existGroup) throw new BadRequestException('Така група вже існує');
    await this.groupRepository.save({ ...dto });
  }

  async getGroups(): Promise<GroupEntity[]> {
    const groups = await this.groupRepository.find();
    return groups;
  }

  async getGroup(id: number): Promise<GroupEntity> {
    const group = await this.groupRepository.findOneBy({ id });
    return group;
  }

  async removeGroup(id: number): Promise<string> {
    const subGroups = await this.subgroupsService.getSubGroups(id);
    if (!subGroups)
      throw new BadRequestException('Немає підгруп у цій групі товарів');

    for (const subGroup of subGroups) {
      await this.subgroupsService.removeImgsSubGroup(subGroup.id);
    }

    await this.groupRepository.delete({ id });
    return 'Видалено';
  }
}
