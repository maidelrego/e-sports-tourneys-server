import { IsEmail, IsString } from 'class-validator';

export class LoginGoogleUserDto {
  @IsEmail()
  email: string;

  @IsString()
  googleId: string;
}
