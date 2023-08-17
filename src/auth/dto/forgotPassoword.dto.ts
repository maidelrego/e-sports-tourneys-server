import { IsEmail } from 'class-validator';

export class LoginGoogleUserDto {
  @IsEmail()
  email: string;
}
