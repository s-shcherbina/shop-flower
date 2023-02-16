import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoodsModule } from '../goods/goods.module';
import { SubGroupsModule } from '../sub-groups/sub-groups.module';
import { ImageEntity } from './entities/image.entity';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageEntity]),
    forwardRef(() => GoodsModule),
    forwardRef(() => SubGroupsModule),
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
