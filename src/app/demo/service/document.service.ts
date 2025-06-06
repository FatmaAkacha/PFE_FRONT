import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Document } from '../domain/document';
import { DocumentClass} from '../domain/documentClass';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrlDocuments = 'http://127.0.0.1:8000/api/documents';
  private apiUrlDocumentClasses = 'http://127.0.0.1:8000/api/document-classes';

  constructor(private httpClient: HttpClient) {}

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // ou 'access_token' selon ton app
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  

  // ✅ Récupérer tous les documents
  getDocuments(): Observable<Document[]> {
    return this.httpClient.get<Document[]>(this.apiUrlDocuments, { headers: this.getHeaders() });
  }

  // ✅ Récupérer un document spécifique par son ID
  getDocumentById(id: number): Observable<Document> {
    return this.httpClient.get<Document>(`${this.apiUrlDocuments}/${id}`, { headers: this.getHeaders() });
  }

  // ✅ Ajouter un nouveau document
  saveDocument(document: Document): Observable<Document> {
    return this.httpClient.post<Document>(this.apiUrlDocuments, document, { headers: this.getHeaders() });
  }

  // ✅ Mettre à jour un document existant
  updateDocument(id: number, document: Document): Observable<Document> {
    return this.httpClient.put<Document>(`${this.apiUrlDocuments}/${id}`, document, { headers: this.getHeaders() });
  }

  // ✅ Supprimer un document
  deleteDocument(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrlDocuments}/${id}`, { headers: this.getHeaders() });
  }

  // ✅ Récupérer toutes les classes de documents
  getDocumentClasses(): Observable<DocumentClass[]> {
    return this.httpClient.get<DocumentClass[]>(this.apiUrlDocumentClasses, { headers: this.getHeaders() });
  }

  // ✅ Récupérer un document par sa classe de document
  getDocumentsByClass(documentClassId: number): Observable<Document[]> {
    return this.httpClient.get<Document[]>(`${this.apiUrlDocuments}?document_class_id=${documentClassId}`, { headers: this.getHeaders() });
  }

  getDernierCodeDocumentParClasse(codeClasseDoc): Observable<string> {
    return this.httpClient.get<string>(`${this.apiUrlDocuments}/dernier-code/${codeClasseDoc}`, { headers: this.getHeaders() });
  }  
  

  getDocumentByIdAndCode(id, codeClasseDoc): Observable<string> {
    return this.httpClient.get<string>(`${this.apiUrlDocuments}/${id}/${codeClasseDoc}`, { headers: this.getHeaders() });
  }  
  updateDocumentClass(id: number, docClass: DocumentClass): Observable<DocumentClass> {
  return this.httpClient.put<DocumentClass>(`${this.apiUrlDocumentClasses}/${id}`, docClass, {
    headers: this.getHeaders()
  });
}
saveDocumentClass(docClass: DocumentClass): Observable<DocumentClass> {
  return this.httpClient.post<DocumentClass>(this.apiUrlDocumentClasses, docClass, {
    headers: this.getHeaders()
  });
}
deleteDocumentClass(id: number): Observable<void> {
  return this.httpClient.delete<void>(`${this.apiUrlDocumentClasses}/${id}`, {
    headers: this.getHeaders()
  });
}


}