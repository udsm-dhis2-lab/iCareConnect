import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LabDateService {
  startDate = signal<Date | undefined>(undefined);
  endDate = signal<Date | undefined>(undefined);
  
  constructor() {}
}
