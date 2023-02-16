import { Module } from '@nestjs/common';
import { OrderGoodsController } from './order-goods.controller';
import { OrderGoodsService } from './order-goods.service';

@Module({
  controllers: [OrderGoodsController],
  providers: [OrderGoodsService]
})
export class OrderGoodsModule {}
