import { Injectable } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiOptions,
  UploadApiResponse,
  v2,
} from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadImage(
    options: UploadApiOptions,
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      toStream(file.buffer).pipe(upload);
    });
  }

  async findAvatars() {
    const { resources } = await v2.search
      .expression('folder:Avatars')
      .execute();

    return resources;
  }

  async findImageByAssetId(asset_id: string) {
    const { resources } = await v2.search
      .expression(`asset_id:${asset_id}`)
      .execute();

    const data = resources.map((resource) => {
      return {
        public_id: resource.public_id,
      };
    });

    return data;
  }

  async deleteImages(asset_id: string) {
    const imageToDelete = await this.findImageByAssetId(asset_id);

    for (const img of imageToDelete) {
      await v2.uploader.destroy(img.public_id);
    }
    return { message: 'Image deleted successfully' };
  }
}
