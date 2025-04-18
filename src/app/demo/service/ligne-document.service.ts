import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LigneDocument } from '../domain/ligne-document';
@Injectable({
  providedIn: 'root'
})
export class LigneDocumentService {
  private apiUrlLignes = 'http://127.0.0.1:8000/api/lignes';

  constructor(private httpClient: HttpClient) {}

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // ajuster selon ton auth
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ✅ Récupérer toutes les lignes
  getAllLignes(): Observable<LigneDocument[]> {
    return this.httpClient.get<LigneDocument[]>(this.apiUrlLignes, { headers: this.getHeaders() });
  }

  // ✅ Récupérer les lignes d’un document spécifique
  getLignesByDocumentId(documentId: number): Observable<LigneDocument[]> {
    return this.httpClient.get<LigneDocument[]>(`${this.apiUrlLignes}/document/${documentId}`, { headers: this.getHeaders() });
  }

  // ✅ Récupérer une seule ligne par ID
  getLigneById(id: number): Observable<LigneDocument> {
    return this.httpClient.get<LigneDocument>(`${this.apiUrlLignes}/${id}`, { headers: this.getHeaders() });
  }

  // ✅ Créer une nouvelle ligne
  saveLigne(ligne: LigneDocument): Observable<LigneDocument> {
    return this.httpClient.post<LigneDocument>(this.apiUrlLignes, ligne, { headers: this.getHeaders() });
  }

  // ✅ Mettre à jour une ligne
  updateLigne(id: number, ligne: LigneDocument): Observable<LigneDocument> {
    return this.httpClient.put<LigneDocument>(`${this.apiUrlLignes}/${id}`, ligne, { headers: this.getHeaders() });
  }

  // ✅ Supprimer une ligne
  deleteLigne(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrlLignes}/${id}`, { headers: this.getHeaders() });
  }
  // 🧾 Créer plusieurs lignes en une seule requête
    saveMultipleLignes(lignes: LigneDocument[]): Observable<LigneDocument[]> {
        return this.httpClient.post<LigneDocument[]>(`${this.apiUrlLignes}/batch`, lignes, { headers: this.getHeaders() });
    }
  
}