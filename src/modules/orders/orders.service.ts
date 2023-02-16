import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateOrderDTO } from './dto';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly usersService: UsersService,
  ) {}

  async createOrder(dto: CreateOrderDTO) {
    const user = await this.usersService.findUserById(dto.userId);
    // const order = new OrderEntity();
    // order.user = user;
    await this.orderRepository.save({ user });
  }
}
