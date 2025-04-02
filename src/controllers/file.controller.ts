import { IncomingMessage, ServerResponse } from 'http';
import { IUploadFile } from '../shared/modules/file.manager';
import FileService from '../services/file.service';

class FileController {
  constructor(
    private readonly fileService = new FileService()
  ) {

  }

  public async upload(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const files: IUploadFile[] = req.files || [];
      const urls = await this.fileService.upload(files);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ urls }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: (error as Error).message }));
    }
  }

  public async replace(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const key = (req as any).params.key;

    if (!key) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing key parameter' }));
      return;
    }

    try {
      const files: IUploadFile[] = req.files || [];
      if (files.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No file provided for replacement' }));
        return;
      }

      const url = await this.fileService.replace(key, files[0]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'File replaced successfully', url }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: (error as Error).message }));
    }
  }

  public async retrieve(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const key = (req as any).params.key;

    if (!key) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing key parameter' }));
      return;
    }

    try {
      const { content, contentType } = await this.fileService.retrieve(key);
      res.writeHead(200, { 'Content-Type': contentType });
      content.pipe(res);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: (error as Error).message }));
    }
  }

  public async delete(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const key = (req as any).params.key;
    
    if (!key) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing key parameter' }));
      return;
    }

    try {
      await this.fileService.delete(key);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'File deleted successfully' }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: (error as Error).message }));
    }
  }
}

export default new FileController();
