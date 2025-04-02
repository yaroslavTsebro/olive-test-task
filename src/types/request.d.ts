import { IUploadFile } from '../shared/modules/file.manager';

declare module 'http' {
  interface IncomingMessage {
    files?: IUploadFile[];
  }
}
