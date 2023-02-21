import { BadRequestException, Injectable } from '@nestjs/common';
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
    if (!user)
      throw new BadRequestException('Заповніть поля або зареєструйтесь');
    await this.orderRepository.save({ user });
  }

  async getOrders(userId: number, completed: boolean): Promise<OrderEntity[]> {
    if (!userId && !completed) return this.orderRepository.find();
    if (!userId && completed) return this.orderRepository.findBy({ completed });
    if (userId && !completed)
      return this.orderRepository
        .createQueryBuilder('orders')
        .where('orders.userId =: id', { id: userId })
        .leftJoinAndSelect('orders.user', 'user')
        .getMany();

    if (userId && completed)
      return this.orderRepository
        .createQueryBuilder('orders')
        .orderBy('orders.completed')
        .where('orders.userId =: id', { id: userId })
        .leftJoinAndSelect('orders.user', 'user')
        .getMany();
  }

  async getOrder(id: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOneBy({ id });
    return order;
  }

  async removeOrder(id: number): Promise<string> {
    await this.orderRepository.delete({ id });
    return 'Видалено';
  }
}
