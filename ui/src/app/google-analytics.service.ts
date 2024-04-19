import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  constructor(@Inject('window') private window: Window & { dataLayer: any[] }) {}

  sendData(moduleName: string, eventName: string, additionalData?: any) {
    const clientName = this.extractClientNameFromDomain(window.location.href);
    const data = {
      event: eventName,
      moduleName: moduleName,
      clientName: clientName,
      ...additionalData
    };
    this.window.dataLayer.push(data);
  }

  private extractClientNameFromDomain(url: string): string {
    try {
      const parsedUrl = new URL(url); 
      const hostnameParts = parsedUrl.hostname.split('.'); 

      return hostnameParts[0];
    } catch (error) {
      console.error('Error parsing URL:', url, error);
      return ''; 
    }
  }
}
