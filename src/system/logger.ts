import { ILogger } from '../shared/system/logger';
import fs from 'fs';
import path from 'path';

class Logger implements ILogger {
  private logFilePath: string;
  private levels = { info: 'INFO', warn: 'WARN', error: 'ERROR' };

  constructor() {
    //TODO: move to constructor & impl. different strategies of writing logs (file, console) and different strategies of transporting, maybe also rotating
    this.logFilePath = path.join(__dirname, '..', 'logs', 'app.log');
    this.ensureLogFile();
  }

  private ensureLogFile(): void {
    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    if (!fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, '', { flag: 'w' });
    }
  }

  private getCallerInfo(): { file: string; line: string; method: string } {
    const error = new Error();
    const stack = error.stack?.split('\n') || [];

    const callerLine = stack.find(line => !line.includes('Logger.') && !line.includes('Error'));

    if (callerLine) {
      const match = callerLine.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        const parts = match[1].split(':');
        const file = parts.slice(0, -2).join(':');
        const line = parts.slice(-2, -1)[0];
        const method = stack[2]?.trim().split(' ')[1] || 'anonymous';

        return { file, line, method };
      }
    }

    return { file: 'unknown', line: 'unknown', method: 'unknown' };
  }

  private writeToConsole(formattedMessage: string): void {
    console.log(formattedMessage.trim());
  }

  private writeToFile(formattedMessage: string): void {
    fs.appendFileSync(this.logFilePath, formattedMessage);
  }

  private formatLog(level: string, message: string, callerInfo: { file: string; line: string; method: string }, meta?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${level}] ${message} (File: ${callerInfo.file}, Line: ${callerInfo.line}, Method: ${callerInfo.method})`;

    if (meta) {
      formattedMessage += ` | Meta: ${JSON.stringify(meta)}`;
    }

    return formattedMessage + '\n';
  }

  private log(level: string, message: string, meta?: Record<string, any>): void {
    const callerInfo = this.getCallerInfo();
    const formattedMessage = this.formatLog(level, message, callerInfo, meta);

    this.writeToConsole(formattedMessage);
    this.writeToFile(formattedMessage);
  }

  public info(message: string, meta?: Record<string, any>): void {
    this.log(this.levels.info, message, meta);
  }

  public warn(message: string, meta?: Record<string, any>): void {
    this.log(this.levels.warn, message, meta);
  }

  public error(message: string, meta?: Record<string, any>): void {
    this.log(this.levels.error, message, meta);
  }
}


export default new Logger();