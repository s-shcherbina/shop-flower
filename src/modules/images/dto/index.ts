import { IsNumberString } from 'class-validator';

export class createImageDTO {
  @IsNumberString()
  goodId: number;
}
