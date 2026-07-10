import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signup(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userData = {
      ...createUserDto,
      password: hashedPassword,
    };
    const user = await this.usersService.create(userData);

    return {
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
