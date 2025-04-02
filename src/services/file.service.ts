import { Readable } from 'node:stream';
import { IUploadFile } from '../shared/modules/file.manager';
import FileManagerService from './file.manager';
import { FileNotFoundException } from '../shared/dto/system/errors/file';

class FileService {
  constructor(
    private readonly fileManagerService = new FileManagerService()
  ) { }

  public async upload(files: IUploadFile[]): Promise<string[]> {
    return this.fileManagerService.uploadFiles(files);
  }

  public async retrieve(key: string): Promise<{ content: Readable, contentType: string }> {
    await this.ensureFileExists(key);
    return this.fileManagerService.retrieveFile(key);
  }

  public async replace(key: string, file: IUploadFile): Promise<string> {
    await this.ensureFileExists(key);
    return this.fileManagerService.replaceFile(key, file);
  }

  public async delete(key: string): Promise<void> {
    await this.ensureFileExists(key);
    return this.fileManagerService.deleteFile(key);
  }

  private async ensureFileExists(key: string): Promise<void> {
    const exists = await this.fileManagerService.exists(key);
    if (!exists) {
      throw new FileNotFoundException(key);
    }
  }
}

export default FileService;