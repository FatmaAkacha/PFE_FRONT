import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../domain/client';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://127.0.0.1:8000/api/clients';
  private authUrl = 'http://localhost:8080/auth/realms/DUX/protocol/openid-connect/token';
  private clientId = 'asm';
  private token: string = '';
  setToken(token: string) {
    this.token = token;
  }
  constructor(private httpClient: HttpClient) { }

  // Obtenir tous les clients
  getClients(): Observable<Client[]> {
    return this.httpClient.get<Client[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // Obtenir un client par ID
  getClientById(id: string): Observable<Client> {
    return this.httpClient.get<Client>(`${this.apiUrl}/${id}`);
  }

  // Ajouter un nouveau client
  insertClient(client: Client): Observable<Client> {
    return this.httpClient.post<Client>(this.apiUrl, client);
  }

  // Modifier un client existant
  updateClient(id: string, client: Client): Observable<Client> {
    return this.httpClient.put<Client>(`${this.apiUrl}/${id}`, client);
  }

  // Supprimer un client
  deleteClient(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }


  login(username: string, password: string): Observable<any> {
    console.log('********************************');
    const body = new URLSearchParams();
    body.set('client_id', this.clientId);
    body.set('grant_type', 'password');
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.httpClient.post(this.authUrl, body.toString(), { headers });
  }
  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });}

}
