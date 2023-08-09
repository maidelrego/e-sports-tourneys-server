import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateGoogleUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  fullName: string;

  @IsString()
  googleId: string;
}
