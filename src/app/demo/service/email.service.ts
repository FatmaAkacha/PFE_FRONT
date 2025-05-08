import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://127.0.0.1:8000/api/sendemail';

  constructor(private httpClient: HttpClient) {}

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // ===========================
  // ✅ Envoi d'email
  // ===========================
  sendEmail(email: string, subject: string, message: string): Observable<any> {
    const emailData = {
      email: email,
      subject: subject,
      message: message
    };

    return this.httpClient.post<any>(this.apiUrl, emailData, {
      headers: this.getHeaders()
    });
  }
}