import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {
  private apiUrlCategories = 'http://127.0.0.1:8000/api/categories'; 
  private token: string = '';

  constructor(private httpClient: HttpClient) { }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // =======================
  // ✅ Gestion des Catégories
  // =======================
  
  // Récupérer toutes les catégories
  getCategories(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.apiUrlCategories, { headers: this.getHeaders() });
  }

  // Récupérer une catégorie spécifique par son ID
  getCategorieById(id: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrlCategories}/${id}`, { headers: this.getHeaders() });
  }

  // Ajouter une nouvelle catégorie
  insertCategorie(categorie: any): Observable<any> {
    return this.httpClient.post<any>(this.apiUrlCategories, categorie, {
      headers: this.getHeaders()
    });
  }
  

  // Mettre à jour une catégorie
  updateCategorie(id: string, categorie: any): Observable<any> {
    return this.httpClient.put<any>(`${this.apiUrlCategories}/${id}`, categorie, { headers: this.getHeaders() });
  }

  // Supprimer une catégorie
  deleteCategorie(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrlCategories}/${id}`, { headers: this.getHeaders() });
  }
}
