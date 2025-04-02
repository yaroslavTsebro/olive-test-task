import { IsInt, IsNotEmpty, IsNumber, IsObject, IsPositive, IsString, ValidateNested } from 'class-validator';
import { IAppConfig } from '../../../system/configs';
import { AwsConfig } from './aws';
import { Type } from 'class-transformer';

export class AppConfig implements IAppConfig {
  @IsObject()
  @ValidateNested()
  @Type(() => AwsConfig)
  aws!: AwsConfig;

  @IsNumber()
  @IsInt()
  @IsPositive()
  port!: number;

  @IsString()
  @IsNotEmpty()
  host!: string
}