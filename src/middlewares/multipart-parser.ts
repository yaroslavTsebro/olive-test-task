import { IncomingMessage } from 'http';
import { IUploadFile } from '../shared/modules/file.manager';
import { Readable } from 'stream';

// https://stackoverflow.com/questions/40576255/nodejs-how-to-parse-multipart-form-data-without-frameworks
export async function multipartParser(req: IncomingMessage): Promise<IUploadFile[]> {
  return new Promise<IUploadFile[]>((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';

    if (!/^multipart\/form-data/i.test(contentType)) {
      return reject(new Error('Invalid Content-Type'));
    }

    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      reject(new Error('No boundary found in Content-Type header'));
      return;
    }

    const files: IUploadFile[] = [];
    const buffers: Buffer[] = [];

    req.on('data', chunk => buffers.push(chunk));
    req.on('end', () => {
      const rawData = Buffer.concat(buffers).toString();
      const parts = rawData.split(`--${boundary}`).slice(1, -1);

      for (const part of parts) {
        const [headers, content] = part.split('\r\n\r\n');
        if (!content) continue;

        const contentDisposition = headers.match(/Content-Disposition: form-data;(.+)/);
        if (!contentDisposition) continue;

        const isFile = contentDisposition[1].includes('filename=');
        const fileNameMatch = contentDisposition[1].match(/filename="(.+?)"/);

        if (isFile && fileNameMatch) {
          const fileBuffer = Buffer.from(content.split('\r\n')[0], 'binary');
          const fileStream = Readable.from(fileBuffer);

          const contentTypeMatch = headers.match(/Content-Type: (.+)/);

          files.push({
            data: fileStream,
            contentType: contentTypeMatch ? contentTypeMatch[1] : 'application/octet-stream'
          });
        }
      }

      resolve(files);
    });

    req.on('error', err => reject(err));
  });
}
