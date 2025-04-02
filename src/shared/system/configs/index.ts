import { IAwsConfig } from './aws';

export interface IAppConfig {
  aws: IAwsConfig;
  port: number;
  host: string;
}