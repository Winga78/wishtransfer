import { 
  DeleteObjectCommand, 
  PutBucketPolicyCommand, 
  PutObjectCommand, 
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl} from "@aws-sdk/s3-request-presigner";
import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private s3!: S3Client;
  private bucketName!: string;
  private minioUrl!: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.minioUrl = this.configService.getOrThrow<string>('MINIO_URL');
    const accessKeyId = this.configService.getOrThrow<string>('MINIO_ROOT_USER');
    const secretAccessKey = this.configService.getOrThrow<string>('MINIO_ROOT_PASSWORD');
    this.bucketName = this.configService.getOrThrow<string>('MINIO_BUCKET_NAME');

    this.s3 = new S3Client({
      region: 'us-east-1',
      endpoint: this.minioUrl,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    await this.ensureBucketExistsAndIsPublic(this.bucketName);
  }

  private async ensureBucketExistsAndIsPublic(bucketName: string): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: bucketName }));
      this.logger.log(`Le bucket '${bucketName}' existe déjà.`);
    } catch (err: any) {
      if (err.name === 'NotFound' || err['$metadata']?.httpStatusCode === 404) {
        this.logger.warn(`Le bucket '${bucketName}' n'existe pas. Création en cours...`);
        try {
          await this.s3.send(new CreateBucketCommand({ Bucket: bucketName }));
          this.logger.log(`Le bucket '${bucketName}' a été créé avec succès.`);
        } catch (createErr: any) {
          this.logger.error(`Impossible de créer le bucket '${bucketName}':`, createErr.message);
          throw createErr;
        }
      } else {
        this.logger.error(`Erreur lors de la vérification du bucket '${bucketName}':`, err.message);
        throw err;
      }
    }

    await this.makeBucketPublic(bucketName);
  }

  async makeBucketPublic(bucketName: string): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    try {
      await this.s3.send(
        new PutBucketPolicyCommand({
          Bucket: bucketName,
          Policy: JSON.stringify(policy),
        }),
      );
      this.logger.log(`La politique d'accès public a été appliquée sur '${bucketName}'.`);
    } catch (err: any) {
      this.logger.error(`Erreur politique publique sur '${bucketName}':`, err.message);
      throw err;
    }
  }

async createPresignedUrlToUpload(fileName: string, expiresIn = 3600): Promise<string> { 
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });
      const url = await getSignedUrl(this.s3, command, { expiresIn });
      this.logger.log(`URL présignée générée pour l'upload de : ${fileName}`);
      return url;
    } catch (err: any) {
      this.logger.error('Erreur lors de l\'upload du fichier sur MinIO:', err.stack);
      throw new HttpException('Échec du téléversement', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createPresignedUrlToDownload(fileName: string, expiresIn = 3600): Promise<string> { 
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });
      const url = await getSignedUrl(this.s3, command, { expiresIn });
      this.logger.log(`URL présignée générée pour le téléchargement de : ${fileName}`);
      return url;
    } catch (err: any) {
      this.logger.error('Erreur lors du téléchargement du fichier sur MinIO:', err.stack);
      throw new HttpException('Échec du téléchargement', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteFile(fileName: string): Promise<boolean> {
    if (!fileName || typeof fileName !== 'string') {
      throw new HttpException('Nom de fichier invalide', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
        }),
      );
      
      this.logger.log(`Fichier supprimé : ${fileName}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Erreur suppression du fichier ${fileName}:`, err.stack);
      throw new HttpException('Impossible de supprimer le fichier', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}