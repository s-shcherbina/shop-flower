import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSubGroupDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  groupId: number;
}
