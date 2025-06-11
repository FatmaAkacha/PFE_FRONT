import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Magasinier } from '../domain/magasinier';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MagasinierService {
  private apiUrl = 'http://localhost:8000/api/magasinier';

  constructor(private http: HttpClient) {}

  getMagasiniers(): Observable<Magasinier[]> {
    return this.http.get<Magasinier[]>(this.apiUrl);
  }

  insertMagasinier(magasinier: Magasinier): Observable<Magasinier> {
    return this.http.post<Magasinier>(this.apiUrl, magasinier);
  }

  updateMagasinier(id: string, magasinier: Magasinier): Observable<Magasinier> {
    return this.http.post<Magasinier>(`${this.apiUrl}/${id}?_method=PUT`, magasinier);
  }

  deleteMagasinier(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
