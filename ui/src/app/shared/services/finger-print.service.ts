import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

@Injectable({
  providedIn: "root",
})

export class FingerprintService {
  model = 'http://localhost:8004/mfs100/'

  constructor(private http: HttpClient) {}

  captureFingerprint(): Observable<any> {
    const requestBody = {
      Quality: 80,
      TimeOut: 20,
    };
    return this.http.post<any>( `${this.model}capture`, requestBody, httpOptions);
  }

  getFingerprintDeviceInfo(): Observable<any> {
   
    return this.http.get<any>( `${this.model}info`, httpOptions);
  }
}
