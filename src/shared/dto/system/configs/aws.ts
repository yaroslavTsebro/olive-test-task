import { IsNotEmpty, IsString } from 'class-validator';
import { IAwsConfig } from '../../../system/configs/aws';

export class AwsConfig implements IAwsConfig {
  @IsString()
  @IsNotEmpty()
  accessKeyId!: string;

  @IsString()
  @IsNotEmpty()
  secretAccessKey!: string;

  @IsString()
  @IsNotEmpty()
  region!: string;

  @IsString()
  @IsNotEmpty()
  bucketName!: string;
}