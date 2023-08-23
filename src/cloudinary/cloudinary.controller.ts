import {
  Post,
  UseInterceptors,
  UploadedFile,
  Controller,
  BadRequestException,
  InternalServerErrorException,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { UploadApiOptions } from 'cloudinary';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private cloudinary: CloudinaryService) {}

  @Get('avatars')
  async getAvatars() {
    try {
      const avatars = await this.cloudinary.findAvatars();
      return avatars;
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageToCloudinary(
    @UploadedFile() file: Express.Multer.File,
    options: UploadApiOptions,
  ) {
    try {
      const uploadedImage = await this.cloudinary.uploadImage(options, file);

      if (uploadedImage) {
        return uploadedImage;
      } else {
        throw new InternalServerErrorException('There was an error uploading');
      }
    } catch (error) {
      this.handleDatabaseExceptions(error);
    }
  }

  private handleDatabaseExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    console.error(error);
    throw new InternalServerErrorException('Unexpected error, check server');
  }
}
