import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../domain/client';
import { Fournisseur } from '../domain/fournisseur';
import { Produit } from '../domain/produit';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrlClients = 'http://127.0.0.1:8000/api/clients';
  private apiUrlFournisseurs = 'http://127.0.0.1:8000/api/fournisseurs'; 
  private apiUrlProduits = 'http://127.0.0.1:8000/api/produits';
  private authUrl = 'http://localhost:8080/auth/realms/DUX/protocol/openid-connect/token';
  private clientId = 'asm';
  private token: string = '';

  constructor(private httpClient: HttpClient) { }

  setToken(token: string) {
    this.token = token;
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  // =======================
  // ✅ Gestion des Clients
  // =======================
  getClients(): Observable<Client[]> {
    return this.httpClient.get<Client[]>(this.apiUrlClients, { headers: this.getHeaders() });
  }

  getClientById(id: string): Observable<Client> {
    return this.httpClient.get<Client>(`${this.apiUrlClients}/${id}`, { headers: this.getHeaders() });
  }

  insertClient(client: Client): Observable<Client> {
    return this.httpClient.post<Client>(this.apiUrlClients, client, { headers: this.getHeaders() });
  }

  updateClient(id: string, client: Client): Observable<Client> {
    return this.httpClient.put<Client>(`${this.apiUrlClients}/${id}`, client, { headers: this.getHeaders() });
  }

  deleteClient(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrlClients}/${id}`, { headers: this.getHeaders() });
  }
  insertClientForm(formData: FormData): Observable<Client> {
    return this.httpClient.post<Client>(this.apiUrlClients, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.token}` // ne pas ajouter 'Content-Type'
      })
    });
  }
  
  updateClientForm(id: string, formData: FormData): Observable<Client> {
    return this.httpClient.post<Client>(`${this.apiUrlClients}/${id}?_method=PUT`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.token}` // ne pas ajouter 'Content-Type'
      })
    });
  }
  getClientLogoSrc(client: Client): string | undefined {
    return typeof client.logo === 'string'
      ? `${this.apiUrlClients}/${client.id}/serve-logo`
      : undefined;
  }
  // =======================
  // ✅ Gestion des Fournisseurs
  // =======================
  getFournisseurs(): Observable<Fournisseur[]> {
    return this.httpClient.get<Fournisseur[]>(this.apiUrlFournisseurs, { headers: this.getHeaders() });
  }

  getFournisseurById(id: string): Observable<Fournisseur> {
    return this.httpClient.get<Fournisseur>(`${this.apiUrlFournisseurs}/${id}`, { headers: this.getHeaders() });
  }

  insertFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.httpClient.post<Fournisseur>(this.apiUrlFournisseurs, fournisseur, { headers: this.getHeaders() });
  }

  updateFournisseur(id: string, fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.httpClient.put<Fournisseur>(`${this.apiUrlFournisseurs}/${id}`, fournisseur, { headers: this.getHeaders() });
  }

  deleteFournisseur(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrlFournisseurs}/${id}`, { headers: this.getHeaders() });
  }
  insertFournisseurForm(formData: FormData): Observable<Fournisseur> {
    return this.httpClient.post<Fournisseur>(this.apiUrlFournisseurs, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.token}` // ne pas ajouter 'Content-Type'
      })
    });
  }
  
  updateFournisseurForm(id: string, formData: FormData): Observable<Fournisseur> {
    return this.httpClient.post<Fournisseur>(`${this.apiUrlFournisseurs}/${id}?_method=PUT`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.token}` // ne pas ajouter 'Content-Type'
      })
    });
  }
  getFournisseurLogoSrc(fournisseur: Fournisseur): string | undefined {
    return typeof fournisseur.logo === 'string'
      ? `${this.apiUrlFournisseurs}/${fournisseur.id}/serve-logo`
      : undefined;
  }

  // =======================
  // ✅ Gestion des Produits
  // =======================
  
  // Récupérer tous les produits
  getProduits(): Observable<Produit[]> {
    return this.httpClient.get<Produit[]>(this.apiUrlProduits, { headers: this.getHeaders() });
  }

  // Récupérer un produit spécifique par son ID
  getProduitById(id: string): Observable<Produit> {
    return this.httpClient.get<Produit>(`${this.apiUrlProduits}/${id}`, { headers: this.getHeaders() });
  }

  // Ajouter un produit
  insertProduit(produit: Produit): Observable<Produit> {
    return this.httpClient.post<Produit>(this.apiUrlProduits, produit, { headers: this.getHeaders() });
  }

  // Mettre à jour un produit
  updateProduit(id: string, produit: Produit): Observable<Produit> {
    return this.httpClient.put<Produit>(`${this.apiUrlProduits}/${id}`, produit, { headers: this.getHeaders() });
  }

  // Supprimer un produit
  deleteProduit(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrlProduits}/${id}`, { headers: this.getHeaders() });
  }
  
  insertProduitForm(formData: FormData): Observable<Produit> {
    return this.httpClient.post<Produit>(this.apiUrlProduits, formData, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.token}` }) 
    });
  }
  
  updateProduitForm(id: string, formData: FormData): Observable<Produit> {
    return this.httpClient.post<Produit>(`${this.apiUrlProduits}/${id}?_method=PUT`, formData, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.token}` }) 
    });
  }
  getImageSrc(produit: Produit): string | undefined {
    return typeof produit.image_data === 'string' ? produit.image_data : undefined;
  }
  

  ajouterProduitFournisseur(formData: FormData): Observable<Produit> {
    return this.httpClient.post<Produit>(`${this.apiUrlProduits}/produits/fournisseur`, formData , {
        headers: new HttpHeaders({ 'Authorization': `Bearer ${this.token}` }) 
      });  
  }


  // =======================
  // ✅ Gestion de l'Authentification
  // =======================
  login(username: string, password: string): Observable<any> {
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
}