/**
 * Sistema de logging estruturado
 * Em produção, apenas errors são exibidos
 * Em desenvolvimento, todos os níveis são exibidos
 */

const isDevelopment = import.meta.env.DEV;

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  context?: string;
  data?: unknown;
}

class Logger {
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, options?: LoggerOptions): string {
    const ctx = options?.context || this.context;
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    return `[${timestamp}] [${ctx}] ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    // Em produção, apenas errors
    if (!isDevelopment) {
      return level === 'error';
    }
    // Em desenvolvimento, tudo
    return true;
  }

  log(message: string, options?: LoggerOptions): void {
    if (!this.shouldLog('log')) return;
    console.log(this.formatMessage('log', message, options));
    if (options?.data) {
      console.log(options.data);
    }
  }

  info(message: string, options?: LoggerOptions): void {
    if (!this.shouldLog('info')) return;
    console.info(this.formatMessage('info', message, options));
    if (options?.data) {
      console.info(options.data);
    }
  }

  warn(message: string, options?: LoggerOptions): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, options));
    if (options?.data) {
      console.warn(options.data);
    }
  }

  error(message: string, error?: Error | unknown, options?: LoggerOptions): void {
    if (!this.shouldLog('error')) return;
    console.error(this.formatMessage('error', message, options));
    if (error) {
      console.error(error);
    }
    if (options?.data) {
      console.error(options.data);
    }
  }

  debug(message: string, options?: LoggerOptions): void {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage('debug', message, options));
    if (options?.data) {
      console.debug(options.data);
    }
  }
}

// Criar loggers específicos para cada módulo
export const cashFlowLogger = new Logger('CashFlow');
export const loansLogger = new Logger('Loans');
export const creditCardLogger = new Logger('CreditCard');
export const investmentLogger = new Logger('Investment');
export const calculationsLogger = new Logger('Calculations');
export const recurrenceLogger = new Logger('Recurrence');
export const dashboardLogger = new Logger('Dashboard');
export const storageLogger = new Logger('Storage');

// Logger genérico
export const logger = new Logger('App');

export default Logger;
