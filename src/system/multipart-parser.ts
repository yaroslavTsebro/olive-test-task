import { Readable } from 'stream';
import { IUploadFile } from '../shared/modules/file.manager';

type ParsedPart = {
  headers: string;
  content: Buffer;
}

export enum ParsingState {
  INIT,
  READING_HEADERS,
  READING_DATA,
  READING_PART_SEPARATOR,
  COMPLETED
}

export class MultipartParser {
  private buffer: Buffer;
  private boundary: Buffer;
  private parts: ParsedPart[];

  constructor(boundary: string) {
    this.buffer = Buffer.alloc(0);
    this.boundary = Buffer.from(`--${boundary}`);
    this.parts = [];
  }

  public appendData(chunk: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);
  }

  public parse(): IUploadFile[] {
    let partStart = 0;
    while (true) {
      const boundaryIndex = this.buffer.indexOf(this.boundary, partStart);
      if (boundaryIndex === -1) break;

      const nextBoundaryIndex = this.buffer.indexOf(this.boundary, boundaryIndex + this.boundary.length);
      if (nextBoundaryIndex === -1) break;

      const part = this.buffer.slice(boundaryIndex + this.boundary.length + 2, nextBoundaryIndex - 2);
      this.processPart(part);
      partStart = nextBoundaryIndex;
    }

    return this.parts.map(this.parsePart);
  }

  private processPart(part: Buffer): void {
    const headersEndIndex = part.indexOf('\r\n\r\n');
    if (headersEndIndex === -1) return;

    const headers = part.slice(0, headersEndIndex).toString();
    const content = part.slice(headersEndIndex + 4);

    this.parts.push({ headers, content });
  }

  private parsePart(part: ParsedPart): IUploadFile {
    const contentDispositionMatch = part.headers.match(/Content-Disposition: form-data;(.+)/i);
    const contentTypeMatch = part.headers.match(/Content-Type: (.+)/i);
    const dispositionData = contentDispositionMatch ? contentDispositionMatch[1] : '';
    const fileNameMatch = dispositionData.match(/filename="(.+?)"/);

    const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';
    const fileName = fileNameMatch ? fileNameMatch[1] : 'unnamed';

    return {
      data: Readable.from(part.content),
      contentType,
      name: fileName
    };
  }

  public static getBoundary(contentType: string): string {
    const items = contentType.split(';');
    for (const item of items) {
      const trimmedItem = item.trim();
      if (trimmedItem.startsWith('boundary=')) {
        return trimmedItem.split('=')[1].trim().replace(/^["']|["']$/g, '');
      }
    }
    return '';
  }
}
