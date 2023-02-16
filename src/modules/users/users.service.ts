import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return hash(password, 5);
  }

  async findUserByPhone(phone: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ phone });
  }

  async findUserById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneBy({ id });
  }

  async findSuperUserByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ email });
  }

  async checkUserByPhone(phone: string): Promise<void> {
    const user = await this.findUserByPhone(phone);
    if (user)
      throw new BadRequestException(
        `${phone} закріплений за іншим користувачем!`,
      );
  }

  async checkSuperUserByEmail(email: string): Promise<void> {
    const user = await this.findSuperUserByEmail(email);
    if (user)
      throw new BadRequestException(
        `${email} закріплений за іншим користувачем!`,
      );
  }

  async createUser(dto: CreateUserDTO): Promise<UserEntity> {
    return this.userRepository.save({ ...dto });
  }

  async updateRole(id: number, role: string): Promise<UserEntity> {
    await this.userRepository.update({ id }, { role });
    return this.userRepository.findOneBy({ id });
  }

  async updateToSuperUser(
    id: number,
    role: string,
    email: string,
    password: string,
  ): Promise<UserEntity> {
    await this.userRepository.update({ id }, { role, email, password });
    return this.userRepository.findOneBy({ id });
  }

  async removeUser(id: number): Promise<string> {
    await this.userRepository.delete({ id });
    return 'Видалено';
  }

  async getAllUsers() {
    const users = await this.userRepository.find();
    return users;
  }
}
