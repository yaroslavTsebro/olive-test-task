import { IncomingMessage } from 'http';
import { IUploadFile } from '../shared/modules/file.manager';
import { ServerResponse } from 'http';
import { NextFunction } from '../system/router';
import { MultipartParser } from '../system/multipart-parser';

export function multipartParser(req: IncomingMessage, res: ServerResponse, next: NextFunction): void {
  const contentType = req.headers['content-type'] || '';
  const boundary = MultipartParser.getBoundary(contentType);

  if (!boundary) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Boundary not found in Content-Type header' }));
    return;
  }

  const parser = new MultipartParser(boundary);

  req.on('data', chunk => parser.appendData(chunk));

  req.on('end', () => {
    try {
      const files: IUploadFile[] = parser.parse();
      (req as any).files = files;
      next();
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Parsing error occurred' }));
    }
  });

  req.on('error', err => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  });
}
