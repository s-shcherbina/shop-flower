import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDTO, UpdateSuperUserDTO } from './dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return await hash(password, 5);
  }

  async findUserByPhone(phone: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({ phone });
  }

  async findUserById(id: number): Promise<UserEntity> {
    return await this.userRepository.findOneBy({ id });
  }

  async findSuperUserByEmail(email: string): Promise<UserEntity> {
    return await this.userRepository.findOneBy({ email });
  }

  async createUser(dto: CreateUserDTO): Promise<UserEntity> {
    return await this.userRepository.save({ ...dto });
  }

  async updateRole(id: number, role: string) {
    await this.userRepository.update({ id }, { role });
  }

  async checkUserByPhoneAndId(id: number, phone: string) {
    const user = await this.findUserByPhone(phone);
    if (user && user.id !== id)
      if (user)
        throw new BadRequestException(
          `${phone} закріплений за іншим користувачем!`,
        );
  }

  async updateToSuperUser(
    id: number,
    role: string,
    email: string,
    password: string,
  ) {
    await this.userRepository.update({ id }, { role, email, password });
  }

  async updateUser(id: number, dto: CreateUserDTO): Promise<string> {
    await this.checkUserByPhoneAndId(id, dto.phone);
    await this.userRepository.update({ id }, { ...dto });
    return 'Оновлено';
  }

  async updateSuperUser(id: number, dto: UpdateSuperUserDTO): Promise<string> {
    await this.checkUserByPhoneAndId(id, dto.phone);
    const user = await this.findSuperUserByEmail(dto.email);
    if (user && user.id !== id)
      throw new BadRequestException(
        `${dto.email} закріплений за іншим користувачем!`,
      );
    await this.userRepository.update({ id }, { ...dto });
    return 'Оновлено';
  }

  async removeUser(id: number): Promise<string> {
    await this.userRepository.delete({ id });
    return 'Видалено';
  }

  async getAllUsers() {
    return await this.userRepository.find();
  }
}
