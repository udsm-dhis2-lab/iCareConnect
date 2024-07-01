import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PatientAppointment } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientAppointmentService {
  private apiUrl = 'http://localhost:4000/api/appointment';

  constructor(private http: HttpClient) { }

  getPatients(): Observable<PatientAppointment[]> {
    return this.http.get<{ message: string, data: any[] }>(this.apiUrl).pipe(
      map(response => response.data.map(item => ({
        id: item.id,
        name: `${item.firstname} ${item.middlename} ${item.surname}`,
        clinician: item.clinician,
        time: item.time,
        gender: item.gender,
        status: item.status
      })))
    );
  }
}
