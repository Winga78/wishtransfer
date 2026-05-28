import { 
  Controller, 
  Post, 
  Delete, 
  Param, 
  HttpCode, 
  HttpStatus, 
  Put,
  Body,
  HttpException,
  Get
} from '@nestjs/common';
import { MinioService } from './minio.service';
import { FileService } from 'src/filedb/file.service';
import { ConfigService } from "@nestjs/config";
import { nanoid } from 'nanoid'

@Controller('files')
export class MinioController {
  constructor(private readonly minioService: MinioService, private readonly fileService: FileService, private readonly configService: ConfigService) {}

  @Post('upload')
  async uploadFile(@Body() body: {originalFileName: string, size: number}) {
    const uniqueFileName = `${nanoid(5)}-${body.originalFileName}`;
    const fileUrl = await this.minioService.createPresignedUrlToUpload(uniqueFileName);
   
    const bucketName = this.configService.getOrThrow<string>('MINIO_BUCKET_NAME');
    const savedFile = await this.fileService.create({
      bucket: bucketName,
      fileName: uniqueFileName,
      originalName: body.originalFileName,
      size: body.size,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending',
    });
    return {
      message: 'URL de téléversement générée avec succès. En attente du transfert.',
      url: fileUrl,
      file: savedFile,
    };
  }

  @Put(':id/confirm')
  async confirmUpload(@Param('id') id: string) {
    const file = await this.fileService.findOne(id);
    if (!file) {
      throw new HttpException('Fichier introuvable', HttpStatus.NOT_FOUND);
    }

    file.status = 'completed';
    file.updatedAt = new Date();
    const updatedFile = await this.fileService.update(id, file);

    return {
      message: 'Le statut du fichier est désormais complété !',
      file: updatedFile,
    };
  }

 @Put(':id/failed')
  async FailedUpload(@Param('id') id: string) {
    const file = await this.fileService.findOne(id);
    if (!file) {
      throw new HttpException('Fichier introuvable', HttpStatus.NOT_FOUND);
    }

    file.status = 'failed';
    file.updatedAt = new Date();
    const updatedFile = await this.fileService.update(id, file);

    return {
      message: 'Le statut du fichier est échoué !',
      file: updatedFile,
    };
  }

  
  @Post(':id/download')
    async downloadFile(@Param('id') id: string) {
        const file = await this.fileService.findOne(id);
        if (!file) {
            throw new HttpException('Fichier introuvable', HttpStatus.NOT_FOUND);
        }
        const fileUrl = await this.minioService.createPresignedUrlToDownload(file.fileName);
        return {
            message: 'URL de téléchargement générée avec succès',
            url: fileUrl,
        };
    }

  @Delete(':id')
    async deleteFileById(@Param('id') id: string) {
      const file = await this.fileService.findOne(id);
      if (!file) {
        throw new HttpException('Fichier introuvable', HttpStatus.NOT_FOUND);
      }
      await this.fileService.delete(id);
      await this.minioService.deleteFile(file.fileName);
      return {
        message: `Le fichier ${file.originalName} a bien été supprimé`,
      };
    }

}