import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { QueryOrderParams, Role } from 'src/types';
import { CreateOrderDTO } from './dto';
import { OrderEntity } from './entities/order.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createOrder(@Body() dto: CreateOrderDTO) {
    return this.ordersService.createOrder(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getOrders(@Query() params: QueryOrderParams): Promise<OrderEntity[]> {
    return this.ordersService.getOrders(params.userId, params.completed);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getOrder(@Param('id') id: number): Promise<OrderEntity> {
    return this.ordersService.getOrder(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  removeOrder(@Param('id') id: number): Promise<string> {
    return this.ordersService.removeOrder(id);
  }
}
