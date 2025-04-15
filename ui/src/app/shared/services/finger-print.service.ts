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
  private apiUrl = "http://localhost:8004/mfs100/capture";

  constructor(private http: HttpClient) {}

  captureFingerprint(): Observable<any> {
    const requestBody = {
      Quality: 80,
      TimeOut: 20,
    };
    return this.http.post<any>(this.apiUrl, requestBody, httpOptions);
  }
}
