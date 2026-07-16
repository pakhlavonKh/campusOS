import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;
  private readonly isS3: boolean;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.isS3 = this.configService.get<string>('STORAGE_PROVIDER') === 's3';
    
    // Ensure local upload directory exists
    if (!this.isS3) {
      fs.mkdir(this.uploadDir, { recursive: true }).catch((err) => {
        this.logger.error(`Failed to create upload directory: ${err.message}`);
      });
    }
  }

  async uploadFile(file: Express.Multer.File, organizationId: string): Promise<string> {
    if (this.isS3) {
      // Mock S3 Upload integration
      this.logger.log(`Uploading file ${file.originalname} to S3 for org ${organizationId}`);
      const fileKey = `${organizationId}/${uuidv4()}-${file.originalname}`;
      return `https://s3.amazonaws.com/campusos-bucket/${fileKey}`;
    }

    // Local Storage saving
    this.logger.log(`Uploading file ${file.originalname} locally for org ${organizationId}`);
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    // Return virtual URL that would map to static files
    return `/uploads/${fileName}`;
  }
}
