import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signUpDto: SignUpDto) {
    console.log('signup started');
    const existingUser = await this.usersService.findByEmail(signUpDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    if (signUpDto.password !== signUpDto.confirmPassword) {
      throw new BadRequestException('Password do not match');
    }
    // console.log('signUpDto', signUpDto);
    // console.log("signUpDto",signUpDto)
    const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
    const userData = {
      ...signUpDto,
      password: hashedPassword,
    };
    const user = await this.usersService.create(userData);
    console.log('Signup done');

    return {
      message: 'User created successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    console.log('Login came till here');

    const existingUser = await this.usersService.findByEmail(loginDto.email);

    if (!existingUser) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      existingUser.password,
    );
    console.log(!!isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const payload = {
      sub: existingUser._id,
      email: existingUser.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
      },
    };
  }
}
