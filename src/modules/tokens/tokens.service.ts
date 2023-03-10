import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { PayloadToken } from 'src/types';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { TokenEntity } from './entities/token.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  generateJwtTokens(userData: PayloadToken) {
    const accessToken = this.jwtService.sign(userData, {
      secret: process.env.JWT_SECRET_ACCESS,
      expiresIn: '30h',
    });
    const refreshToken = this.jwtService.sign(userData, {
      secret: process.env.JWT_SECRET_REFRESH,
      expiresIn: '30d',
    });
    return { accessToken, refreshToken };
  }

  validateRefreshToken(token: string): PayloadToken {
    const userData: PayloadToken = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET_REFRESH,
    });
    return userData;
  }

  async findToken(refreshToken: string): Promise<TokenEntity> {
    return await this.tokenRepository.findOneBy({ refreshToken });
  }

  async getTokenByUserId(userId: number): Promise<TokenEntity> {
    return await this.tokenRepository
      .createQueryBuilder('token')
      .where('token.userId = :id', { id: userId })
      .leftJoinAndSelect('token.user', 'user')
      .getOne();
  }

  async saveToken(refreshToken: string, userId: number) {
    const user = await this.usersService.findUserById(userId);
    const token = await this.getTokenByUserId(userId);
    console.log(token);
    token
      ? await this.tokenRepository.update({ id: token.id }, { refreshToken })
      : await this.tokenRepository.save({
          refreshToken,
          user,
        });
    console.log(token);
  }

  async removeToken(refreshToken: string): Promise<string> {
    await this.tokenRepository.delete({ refreshToken });
    return '????????????????';
  }
}
