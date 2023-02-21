import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Roles } from 'src/decorators/roles.decorators';
import { UserId } from 'src/decorators/userId.decorators';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from 'src/types';
import { CreateUserDTO, UpdateSuperUserDTO } from './dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('user')
  updateUser(
    @Body() dto: CreateUserDTO,
    @UserId() id: number,
  ): Promise<string> {
    return this.usersService.updateUser(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperUser)
  @Patch('super_user')
  updateSuperUser(
    @Body() dto: UpdateSuperUserDTO,
    @UserId() id: number,
  ): Promise<string> {
    return this.usersService.updateSuperUser(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  async removeUserByAdmin(
    @Param('id') id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    return await this.usersService.removeUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async removeUserByUser(
    @Res({ passthrough: true }) res: Response,
    @UserId() id: number,
  ) {
    const response = await this.usersService.removeUser(id);
    res.clearCookie('refreshToken');
    return response;
  }
}
