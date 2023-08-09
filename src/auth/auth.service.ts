import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/index';
import { JwtService } from '@nestjs/jwt';
import { CreateGoogleUserDto } from './dto/create-google-user.dto copy';
import { LoginGoogleUserDto } from './dto/login-google-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  getUsers() {
    return this.userRepository.find({ relations: { tournaments: true } });
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;

      const newUser = this.userRepository.create({
        ...userData,
        password: await bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(newUser);

      delete newUser.password;
      console.log(newUser);
      return {
        ...newUser,
        token: this.getJwt({ id: newUser.id }),
      };
    } catch (err) {
      this.handleErrors(err);
    }
  }

  async registerGoogle(createGoogleUserDto: CreateGoogleUserDto) {
    try {
      const newUser = this.userRepository.create(createGoogleUserDto);
      await this.userRepository.save(newUser);

      return {
        ...newUser,
        token: this.getJwt({ id: newUser.id }),
      };
    } catch (err) {
      this.handleErrors(err);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, fullName: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials(Email)');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Invalid credentials');

    return {
      ...user,
      token: this.getJwt({ id: user.id }),
    };
  }

  async loginGoogle(loginGoogleUserDto: LoginGoogleUserDto) {
    const { email } = loginGoogleUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, fullName: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials(Email)');

    return {
      ...user,
      token: this.getJwt({ id: user.id }),
    };
  }

  private getJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwt({ id: user.id }),
    };
  }

  private handleErrors(err: any) {
    if (err.code === '23505') {
      throw new BadRequestException(err.detail);
    }
    console.log(err);
    throw new InternalServerErrorException('Something went wrong, check logs');
  }
}
