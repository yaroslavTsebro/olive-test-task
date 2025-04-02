export class FileNotFoundException extends Error {
  constructor(key: string) {
    super(`File with key '${key}' does not exist.`);
    this.name = 'FileNotFoundException';
  }
}