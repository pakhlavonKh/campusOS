import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { StorageService } from '../services/storage.service';
import { TenantId } from '../../../common/decorators/tenant.decorator';

@ApiTags('storage')
@ApiBearerAuth()
@Controller('storage')
@UseGuards(AuthGuard('jwt'))
export class UploadController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, callback) => {
        const allowedExtensions = /\.(pdf|png|jpg|jpeg|docx|xlsx|pptx)$/i;
        if (!file.originalname.match(allowedExtensions)) {
          return callback(
            new BadRequestException('Only PDF, Word, Excel, PPTX, and Image files are allowed.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @TenantId() organizationId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const url = await this.storageService.uploadFile(file, organizationId);
    return {
      success: true,
      data: {
        url,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
