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
import { EmailService } from '../email/email.service';
import { resetPasswordTemplate } from '../helpers/resetPasswordTemplate';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { getDefaultAvatar } from '../helpers/getDefaultAvatar';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  getUsers() {
    return this.userRepository.find({ relations: { tournaments: true } });
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const randomAvatar = await getDefaultAvatar(userData.fullName);

      const newUser = this.userRepository.create({
        ...userData,
        password: await bcrypt.hashSync(password, 10),
        avatar: randomAvatar,
      });
      await this.userRepository.save(newUser);

      delete newUser.password;
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
      select: {
        email: true,
        password: true,
        id: true,
        fullName: true,
        avatar: true,
      },
      relations: ['notifications', 'friends'],
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

    let user: User = null;

    user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true,
        fullName: true,
        avatar: true,
      },
      relations: ['notifications', 'friends'],
    });

    if (!user) {
      user = this.userRepository.create(loginGoogleUserDto);
      await this.userRepository.save(user);
      user.notifications = [];
      user.friends = [];
    }

    return {
      ...user,
      token: this.getJwt({ id: user.id }),
    };
  }

  async forgotPassword(forgotPasswordDto: { email: string }) {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['notifications', 'friends'],
    });

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
        relations: ['notifications', 'friends'],
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

  async update(updateUserDto: UpdateUserDto, id: string) {
    const user = await this.findUserById(id);

    const { image, ...resOfUser } = updateUserDto;

    if (image) {
      if (user.cloudinaryId) {
        await this.cloudinaryService.deleteImages(user.cloudinaryId);
      }

      const { secure_url, asset_id } = await this.cloudinaryService.uploadImage(
        { folder: 'Avatars' },
        image,
      );

      resOfUser.avatar = secure_url;
      resOfUser.cloudinaryId = asset_id;
    }

    try {
      Object.assign(user, resOfUser);
      await this.userRepository.save(user);
    } catch (error) {
      this.handleErrors(error);
    }

    return await this.findUserById(id);
  }

  private async findUserById(id: string) {
    return await this.userRepository.findOne({
      where: { id: id },
      relations: ['notifications', 'friends'],
    });
  }

  private getJwt(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async checkAuthStatus(user: User) {
    const userRelations = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['notifications', 'friends'],
    });

    return {
      ...userRelations,
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
