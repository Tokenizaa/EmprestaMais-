
import { supabaseService } from '../services/supabaseService';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  details?: any;
  timestamp: string;
}

class SystemLogger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOCAL_LOGS = 100;

  private createLogEntry(level: LogLevel, message: string, details?: any): LogEntry {
    return {
      level,
      message,
      details: details instanceof Error ? { name: details.name, message: details.message, stack: details.stack } : details,
      timestamp: new Date().toISOString()
    };
  }

  public async log(level: LogLevel, message: string, details?: any, userId?: string) {
    const entry = this.createLogEntry(level, message, details);
    
    // 1. Console Output (sempre visível em dev)
    const style = level === LogLevel.ERROR || level === LogLevel.CRITICAL ? 'color: red; font-weight: bold' : 'color: blue';
    console.log(`%c[${level}] ${message}`, style, details || '');

    // 2. Local Storage Backup (para debugging imediato)
    this.logs.unshift(entry);
    if (this.logs.length > this.MAX_LOCAL_LOGS) this.logs.pop();
    
    // 3. Enviar para Supabase (se conectado)
    // Evita loop infinito se o erro for no próprio Supabase
    if (message.includes('Supabase')) return;

    try {
        // Tenta enviar para a tabela de logs se o serviço estiver ativo
        // Usamos uma chamada "fire and forget" para não travar a aplicação
        supabaseService.logErrorToDB(level, message, entry.details, userId).catch(err => {
            console.warn("Failed to send log to remote DB", err);
        });
    } catch (e) {
        // Falha silenciosa no logger remoto
    }
  }

  public info(message: string, details?: any) { this.log(LogLevel.INFO, message, details); }
  public warn(message: string, details?: any) { this.log(LogLevel.WARN, message, details); }
  public error(message: string, details?: any, userId?: string) { this.log(LogLevel.ERROR, message, details, userId); }
  
  public getLocalLogs() {
    return this.logs;
  }
}

export const logger = new SystemLogger();
