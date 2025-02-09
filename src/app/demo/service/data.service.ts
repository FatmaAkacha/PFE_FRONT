import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../domain/client';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private httpClient: HttpClient) { }


  getClients(): Observable<Client[]> {
    return this.httpClient.get<Client[]>('http://127.0.0.1:8000/api/clients');
  }
  
  getClientById(id: string): Observable<Client> {
    return this.httpClient.get<Client>('http://127.0.0.1:8000/api/clients/' + id);
  }

  insertClient(client: Client): Observable<Client> {
    return this.httpClient.post<Client>('http://127.0.0.1:8000/api/addClient', client);
  }
  
  deleteClient(id: string): Observable<void> {
    return this.httpClient.delete<void>('http://127.0.0.1:8000/api/deleteClient/' + id);
  }

  updateClient(id: string, client: Client): Observable<Client> {
    return this.httpClient.put<Client>('http://127.0.0.1:8000/api/updateClient/' + id, client);
  }

}
