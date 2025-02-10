import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../domain/client';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://127.0.0.1:8000/api/clients';
  constructor(private httpClient: HttpClient) { }

  // Obtenir tous les clients
  getClients(): Observable<Client[]> {
    return this.httpClient.get<Client[]>(this.apiUrl);
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

}
