import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { SubGroupsModule } from '../sub-groups/sub-groups.module';
import { GoodEntity } from './entities/good.entity';
import { GoodsController } from './goods.controller';
import { GoodsService } from './goods.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoodEntity]),
    forwardRef(() => ImagesModule),
    forwardRef(() => SubGroupsModule),
  ],
  controllers: [GoodsController],
  providers: [GoodsService],
  exports: [GoodsService],
})
export class GoodsModule {}
