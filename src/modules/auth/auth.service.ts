import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare } from 'bcrypt';
import { TokensService } from 'src/modules/tokens/tokens.service';
import { AuthResponse } from 'src/types';
import { CreateSuperUserDTO, CreateUserDTO } from 'src/modules/users/dto';
import { UsersService } from 'src/modules/users/users.service';
import { LoginSuperUserDTO, LoginUserDTO } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokensService,
  ) {}

  async createResponse(
    id: number,
    role: string,
    phone: string,
  ): Promise<AuthResponse> {
    const userData = { id, role, phone };
    const tokens = this.tokenService.generateJwtTokens(userData);
    await this.tokenService.saveToken(tokens.refreshToken, id);
    return { userData, ...tokens };
  }

  async registerUser(dto: CreateUserDTO): Promise<AuthResponse> {
    await this.usersService.checkUserByPhone(dto.phone);
    const user = await this.usersService.createUser(dto);
    return this.createResponse(user.id, user.role, user.phone);
  }

  async registerPrivelegUser(dto: CreateSuperUserDTO): Promise<AuthResponse> {
    let role = 'SUPER_USER';
    const user = await this.usersService.findUserById(dto.userId);
    if (!user) throw new BadRequestException(`Відсутні попередні данні`);
    await this.usersService.checkSuperUserByEmail(dto.email);

    if (dto.invite) {
      if (dto.invite === process.env.ADMIN_INVITE) {
        role = 'ADMIN';
      } else {
        throw new BadRequestException(
          'Не достатньо прав на створення адміністратора',
        );
      }
    }

    dto.password = await this.usersService.hashPassword(dto.password);
    await this.usersService.updateToSuperUser(
      user.id,
      role,
      dto.email,
      dto.password,
    );
    return this.createResponse(user.id, role, user.phone);
  }

  async loginUser(dto: LoginUserDTO): Promise<AuthResponse> {
    const existUser = await this.usersService.findUserByPhone(dto.phone);
    if (!existUser)
      throw new BadRequestException(
        `${dto.phone} незакріплений за жодним користувачем!`,
      );
    if (existUser.role !== 'USER') {
      existUser.role = 'USER ' + existUser.role.slice(0, 1);
      await this.usersService.updateRole(existUser.id, existUser.role);
    }
    return this.createResponse(existUser.id, existUser.role, existUser.phone);
  }

  async loginPrivilegUser(dto: LoginSuperUserDTO): Promise<AuthResponse> {
    const existUser = await this.usersService.findSuperUserByEmail(dto.email);
    if (!existUser)
      throw new BadRequestException(
        `${dto.email} незакріплений за жодним користувачем!`,
      );

    const validatePassword = await compare(dto.password, existUser.password);
    if (!validatePassword) throw new BadRequestException(`Помилка входу!`);
    if (existUser.role.slice(-1) === 'A') existUser.role = 'ADMIN';
    if (existUser.role.slice(-1) === 'S') existUser.role = 'SUPER_USER';

    await this.usersService.updateRole(existUser.id, existUser.role);

    return this.createResponse(existUser.id, existUser.role, existUser.phone);
  }

  async logout(refreshToken: string): Promise<string> {
    return this.tokenService.removeToken(refreshToken);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    try {
      if (!refreshToken) throw new UnauthorizedException(`Не авторизований`);

      const userData = this.tokenService.validateRefreshToken(refreshToken);
      const tokenFromDb = await this.tokenService.findToken(refreshToken);
      if (!userData || !tokenFromDb)
        throw new UnauthorizedException(`Не авторизований`);

      return this.createResponse(userData.id, userData.role, userData.phone);
    } catch (e) {
      throw new UnauthorizedException(`Не авторизований`);
    }
  }
}
