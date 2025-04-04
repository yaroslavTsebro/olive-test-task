import { Readable } from 'node:stream';
import { IFileManagerService, IUploadFile } from '../shared/modules/file.manager';
import { ICryptoService } from '../shared/system/crypto';
import config from '../system/configs/config.service';
import CryptoService from '../system/crypto';
import logger from '../system/logger';
import AWS from 'aws-sdk';

const { accessKeyId, secretAccessKey, region, bucketName } = config.aws;

class FileManagerService implements IFileManagerService {
  private readonly s3: AWS.S3;
  private readonly cryptoService: ICryptoService;

  constructor() {
    AWS.config.update({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
      region: region,
    });

    this.s3 = new AWS.S3();
    this.cryptoService = new CryptoService();
  }

  public async uploadFiles(files: IUploadFile[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadSingleFile(file));
    return Promise.all(uploadPromises);
  }

  private async uploadSingleFile(file: IUploadFile): Promise<string> {

    const params = {
      Bucket: bucketName,
      Key: file.name,
      Body: file.data,
      ContentType: file.contentType,
    };

    const { Location } = await this.s3.upload(params).promise();
    logger.info(`File uploaded successfully: ${Location}`);
    return Location;
  }

  public async retrieveFile(key: string): Promise<{ content: Readable, contentType: string }> {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    const data = await this.s3.getObject(params).promise();
    const contentStream = Readable.from(data.Body as Buffer);

    return { content: contentStream, contentType: data.ContentType || 'application/octet-stream' };
  }

  public async replaceFile(key: string, file: IUploadFile): Promise<string> {
    await this.deleteFile(key);
    return this.uploadSingleFile(file);
  }

  public async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    await this.s3.deleteObject(params).promise();
    logger.info(`File deleted successfully: ${key}`);
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const params = { Bucket: bucketName, Key: key, };
      
      await this.s3.headObject(params).promise();
      return true;
    } catch (error: any) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }
}

export default FileManagerService;
