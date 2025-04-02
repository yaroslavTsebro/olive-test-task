import { IncomingMessage, ServerResponse } from 'http';
import { IUploadFile } from '../shared/modules/file.manager';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export const validateContentTypeMiddleware = (req: IncomingMessage, res: ServerResponse, next: Function) => {
  if (!req.files || !Array.isArray(req.files)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No files found.' }));
    return;
  }

  const invalidFiles = (req.files as IUploadFile[]).filter(file => !ALLOWED_CONTENT_TYPES.includes(file.contentType));

  if (invalidFiles.length > 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid file type(s) uploaded.' }));
    return;
  }

  next();
};
