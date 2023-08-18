import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginGoogleUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  fullName: string;

  @IsString()
  googleId: string;
}
