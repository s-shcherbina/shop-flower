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
    private readonly tokensService: TokensService,
  ) {}

  async createResponse(id: number, role: string): Promise<AuthResponse> {
    const userData = { id, role };
    const tokens = this.tokensService.generateJwtTokens(userData);
    await this.tokensService.saveToken(tokens.refreshToken, id);
    console.log(userData, tokens);
    return { userData, ...tokens };
  }

  async registerUser(dto: CreateUserDTO): Promise<AuthResponse> {
    const existUser = await this.usersService.findUserByPhone(dto.phone);
    if (existUser)
      throw new BadRequestException(
        `${dto.phone} закріплений за іншим користувачем!`,
      );
    const user = await this.usersService.createUser(dto);
    return this.createResponse(user.id, user.role);
  }

  async registerPrivelegUser(
    id: number,
    dto: CreateSuperUserDTO,
  ): Promise<AuthResponse> {
    let role = 'SUPER_USER';
    const user = await this.usersService.findSuperUserByEmail(dto.email);
    if (user)
      throw new BadRequestException(
        `${dto.email} закріплений за іншим користувачем!`,
      );
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
      id,
      role,
      dto.email,
      dto.password,
    );
    return this.createResponse(id, role);
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
    return this.createResponse(existUser.id, existUser.role);
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

    return this.createResponse(existUser.id, existUser.role);
  }

  async logout(refreshToken: string): Promise<string> {
    return this.tokensService.removeToken(refreshToken);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    try {
      if (!refreshToken) throw new UnauthorizedException(`Не авторизований`);

      const userData = this.tokensService.validateRefreshToken(refreshToken);
      const tokenFromDb = await this.tokensService.findToken(refreshToken);
      if (!userData || !tokenFromDb)
        throw new UnauthorizedException(`Не авторизований`);

      return this.createResponse(userData.id, userData.role);
    } catch (e) {
      throw new UnauthorizedException(`Не авторизований`);
    }
  }
}
