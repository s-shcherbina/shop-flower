import { IsNumber } from 'class-validator';

export class CreateOrderDTO {
  @IsNumber()
  userId: number;
}
