import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDTO } from './dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @Post()
  createOrder(@Body() dto: CreateOrderDTO) {
    return this.ordersService.createOrder(dto);
  }
}
