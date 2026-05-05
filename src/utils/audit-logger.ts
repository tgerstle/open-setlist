export interface AuditLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  event: string;
  details?: any;
}

export class AuditLogger {
  constructor() { }

  public log(event: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO', details?: any) {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      details,
    };

    const logLine = JSON.stringify(entry);

    if (level === 'ERROR') {
      process.stderr.write(logLine + '\n');
    } else {
      process.stdout.write(logLine + '\n');
    }
  }

  public rotate() { }
  private cleanupOldLogs() { }
}

export const auditLogger = new AuditLogger();
