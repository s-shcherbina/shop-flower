import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsModule } from '../groups/groups.module';
import { ImagesModule } from '../images/images.module';
import { SubGroupEntity } from './entities/sub-group.entity';
import { SubGroupsController } from './sub-groups.controller';
import { SubGroupsService } from './sub-groups.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubGroupEntity]),
    forwardRef(() => GroupsModule),
    forwardRef(() => ImagesModule),
  ],
  controllers: [SubGroupsController],
  providers: [SubGroupsService],
  exports: [SubGroupsService],
})
export class SubGroupsModule {}
