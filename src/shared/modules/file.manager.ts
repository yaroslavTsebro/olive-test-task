import { Readable } from 'stream';

export interface IUploadFile {
  name: string;
  contentType: string;
  data: Readable;
}

export interface IFileManagerService {
  uploadFiles(files: IUploadFile[]): Promise<string[]>;

  retrieveFile(key: string): Promise<{ content: Readable, contentType: string }>;

  replaceFile(key: string, file: IUploadFile): Promise<string>;

  deleteFile(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;
}
