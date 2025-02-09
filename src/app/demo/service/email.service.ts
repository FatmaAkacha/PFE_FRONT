import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private apiUrl = 'http://127.0.0.1:8000/api/sendemail';

  constructor(private http: HttpClient) { }

  sendEmail(email: string, subject: string, message: string): Observable<any> {
    const emailData = {
      email: email,
      subject: subject,
      message: message
    };
    return this.http.post(this.apiUrl, emailData);
  }
}
