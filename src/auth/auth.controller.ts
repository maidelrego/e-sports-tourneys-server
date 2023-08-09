import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GetUser, RoleProtected, RawHeaders, Auth } from './decorators/index';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';
import { CreateGoogleUserDto } from './dto/create-google-user.dto copy';
import { LoginGoogleUserDto } from './dto/login-google-user.dto';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  getUsers() {
    return this.authService.getUsers();
  }

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('register-google')
  createGoogleUser(@Body() createGoogleUserDto: CreateGoogleUserDto) {
    return this.authService.registerGoogle(createGoogleUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('login-google')
  loginGoogleUser(@Body() loginGoogleUserDto: LoginGoogleUserDto) {
    return this.authService.loginGoogle(loginGoogleUserDto);
  }

  @Get('check-auth-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: User,
    @RawHeaders() rawHeaders: string[],
  ) {
    // inside @GetUser() is the data in the custom decorator
    return {
      message: 'This is a private route',
      user,
      userEmail,
      rawHeaders,
    };
  }

  @Get('private2')
  @RoleProtected(ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      message: 'This is a private route 2',
      user,
    };
  }

  @Get('private3')
  @Auth()
  privateRoute3(@GetUser() user: User) {
    return {
      message: 'This is a private route 2',
      user,
    };
  }
}
