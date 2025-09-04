// Import environment at the top of the file
import { environment } from '../../../environments/environment.development';

export class ConsoleLogger {
  private static isDevelopment = !environment.production;

  static logError(context: string, error: any, additionalData?: any): void {
    if (this.isDevelopment) {
      console.group(`🔴 Error in ${context}`);
      console.error('Error Details:', error);
      if (additionalData) {
        console.log('Additional Data:', additionalData);
      }
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }
  }

  static logInfo(context: string, message: string, data?: any): void {
    if (this.isDevelopment) {
      console.group(`ℹ️ Info: ${context}`);
      console.log('Message:', message);
      if (data) {
        console.log('Data:', data);
      }
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }
  }

  static logApiCall(method: string, url: string, request?: any, response?: any): void {
    if (this.isDevelopment) {
      console.group(`🌐 API Call: ${method} ${url}`);
      if (request) {
        console.log('Request:', request);
      }
      if (response) {
        console.log('Response:', response);
      }
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }
  }
}