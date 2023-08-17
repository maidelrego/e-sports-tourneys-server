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
import { EmailService } from 'src/email/email.service';
import { resetPasswordTemplate } from '../helpers/resetPasswordTemplate';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
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

  async forgotPassword(forgotPasswordDto: { email: string }) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new UnauthorizedException('Invalid credentials(Email)');

    const token = this.jwtService.sign({ id: user.id }, { expiresIn: '1m' });

    const link = `${
      process.env.STAGE === 'prod' ? process.env.PROD_ENV : process.env.DEV_ENV
    }/reset-password/${token}`;

    const mail = {
      to: email,
      from: 'noreply@yolysdelights.com',
      subject: 'Reset your password',
      html: resetPasswordTemplate(link),
    };

    await this.emailService.send(mail);

    return {
      message:
        'If the email is correct, you will receive an email with the instructions to reset your password',
    };
  }

  async resetPassword(resetPasswordDto: { token: string; password: string }) {
    const { token, password } = resetPasswordDto;

    try {
      const payload = await this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });

      if (!user) throw new UnauthorizedException('Invalid credentials(Email)');

      user.password = await bcrypt.hashSync(password, 10);

      await this.userRepository.save(user);

      return {
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new UnauthorizedException('Token expired');
    }
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
