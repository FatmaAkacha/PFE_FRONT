import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Devis } from '../domain/devis';
import { Produit } from '../domain/produit';

@Injectable({
  providedIn: 'root'
})
export class DevisService {
  private apiUrlDevis = 'http://127.0.0.1:8000/api/devis'; 
  private apiUrlClients = 'http://127.0.0.1:8000/api/clients';
  private apiUrlProduits = 'http://127.0.0.1:8000/api/produits';

  constructor(private httpClient: HttpClient) {}

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // ✅ Récupérer tous les devis
  getDevis(): Observable<Devis[]> {
    return this.httpClient.get<Devis[]>(this.apiUrlDevis, { headers: this.getHeaders() });
  }

  // ✅ Récupérer un devis spécifique par son ID
  getDevisById(id: number): Observable<Devis> {
    return this.httpClient.get<Devis>(`${this.apiUrlDevis}/${id}`, { headers: this.getHeaders() });
  }

  // ✅ Ajouter un nouveau devis
  saveDevis(devis: Devis): Observable<Devis> {
    return this.httpClient.post<Devis>(this.apiUrlDevis, devis, { headers: this.getHeaders() });
  }

  // ✅ Mettre à jour un devis existant
  updateDevis(id: number, devis: Devis): Observable<Devis> {
    return this.httpClient.put<Devis>(`${this.apiUrlDevis}/${id}`, devis, { headers: this.getHeaders() });
  }

  // ✅ Supprimer un devis
  deleteDevis(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrlDevis}/${id}`, { headers: this.getHeaders() });
  }


getClients(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.apiUrlClients, { headers: this.getHeaders() });
  }
  
  getProduits(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.apiUrlProduits, { headers: this.getHeaders() });
  }
  getDevisByClient(clientId: number): Observable<Devis[]> {
    return this.httpClient.get<Devis[]>(`${this.apiUrlDevis}?client_id=${clientId}`, { headers: this.getHeaders() });
  }
  getProduitsByClient(clientId: number): Observable<Produit[]> {
    return this.httpClient.get<Produit[]>(`${this.apiUrlProduits}?client_id=${clientId}`, { headers: this.getHeaders() });
  }
  downloadPDF(id: number) {
    return this.httpClient.get(`http://127.0.0.1:8000/api/devis/${id}/download-pdf`, {
      responseType: 'blob' // Important pour recevoir un PDF
    });
  }
}
