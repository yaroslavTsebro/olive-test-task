import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { IAppConfig } from '../../shared/system/configs';
import { IAwsConfig } from '../../shared/system/configs/aws';
import { AppConfig } from '../../shared/dto/system/configs';
import { configDotenv } from 'dotenv';
configDotenv({})

const parsed: IAppConfig = {
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    bucketName: process.env.AWS_BUCKET_NAME
  } as IAwsConfig,

  port: Number.parseInt(process.env.PORT || '3000'),

  host: process.env.HOST || 'localhost'
}

export function validate(config: IAppConfig) {
  const validatedConfig = plainToInstance(AppConfig, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Validation failed for environment variables: ${errors
        .map((err) => Object.values(err.constraints || {}).join(', '))
        .join('; ')}`,
    );
  }

  return validatedConfig;
}

export default validate(parsed)
