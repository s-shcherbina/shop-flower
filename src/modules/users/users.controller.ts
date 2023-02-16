import { Controller, Delete, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Roles } from 'src/decorators/roles.decorators';
import { UserId } from 'src/decorators/userId.decorators';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from 'src/types';
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
  @Delete()
  async removeUser(
    @Res({ passthrough: true }) res: Response,
    @UserId() id: number,
  ): Promise<string> {
    const response = await this.usersService.removeUser(id);
    res.clearCookie('refreshToken');
    return response;
  }
}
