import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoodsService } from '../goods/goods.service';
import { OrdersService } from '../orders/orders.service';
import { createOrderGoodDTO } from './dto';
import { OrderGoodEntity } from './entities/order-good.entity';

@Injectable()
export class OrderGoodsService {
  constructor(
    @InjectRepository(OrderGoodEntity)
    private readonly orderGoodRepository: Repository<OrderGoodEntity>,
    private readonly goodsService: GoodsService,
    private readonly ordersService: OrdersService,
  ) {}

  async createOrderGood(dto: createOrderGoodDTO) {
    const good = await this.goodsService.getGood(dto.goodId);
    if (!good) throw new BadRequestException('Немає такого товару');
    const order = await this.ordersService.getOrder(dto.orderId);
    if (!order) throw new BadRequestException('Немає такого замовлення');
    await this.orderGoodRepository.save({ items: dto.items, good, order });
  }

  async getOrderGoods(
    goodId: number,
    orderId: number,
  ): Promise<OrderGoodEntity[]> {
    const orderGoods = await this.orderGoodRepository
      .createQueryBuilder('orderGoods')
      .where('orderGoods.goodId =: id', { id: goodId })
      .where('orderGoods.orderId =: id', { id: orderId })
      .leftJoinAndSelect('orderGoods.good', 'good')
      .leftJoinAndSelect('orderGoods.order', 'order')
      .getMany();
    return orderGoods;
  }

  async getOrderGood(id: number): Promise<OrderGoodEntity> {
    const order = await this.orderGoodRepository.findOneBy({ id });
    return order;
  }

  async removeOrderGood(id: number): Promise<string> {
    await this.orderGoodRepository.delete({ id });
    return 'Видалено';
  }
}
