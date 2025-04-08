import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../demo/service/document.service';
import { Document } from '../demo/domain/document';
import { DocumentClass } from '../demo/domain/documentClass';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
})
export class DocumentComponent implements OnInit {
  documents: Document[] = [];
  documentClasses: DocumentClass[] = [];
  selectedDocumentClassId: number | null = null;
  newDocument: Document = {
    id: 0,  // Si vous avez un id généré côté backend, laissez-le à 0
    libelle: '',
    code: '',
    codeclassedocument: '',
    document_class_id: 0,
    documentClass: null,  // Initialisé à null, ou vous pouvez définir une instance vide de DocumentClass
  };
  selectedDocument: Document | null = null;

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadDocuments();
    this.loadDocumentClasses();
  }

  // Charger tous les documents
  loadDocuments(): void {
    this.documentService.getDocuments().subscribe(
      (data) => {
        this.documents = data;
      },
      (error) => {
        console.error('Error loading documents:', error);
      }
    );
  }

  // Charger toutes les classes de documents
  loadDocumentClasses(): void {
    this.documentService.getDocumentClasses().subscribe(
      (data) => {
        this.documentClasses = data;
      },
      (error) => {
        console.error('Error loading document classes:', error);
      }
    );
  }

  // Filtrer les documents par classe de document
  filterByDocumentClass(): void {
    if (this.selectedDocumentClassId) {
      this.documentService.getDocumentsByClass(this.selectedDocumentClassId).subscribe(
        (data) => {
          this.documents = data;
        },
        (error) => {
          console.error('Error filtering documents:', error);
        }
      );
    } else {
      this.loadDocuments();
    }
  }

  // Sélectionner un document pour la modification
  selectDocument(document: Document): void {
    this.selectedDocument = { ...document };
  }

  // Ajouter un nouveau document
  addDocument(): void {
    this.documentService.saveDocument(this.newDocument).subscribe(
      (data) => {
        this.documents.push(data);
        this.newDocument = {
          id: 0,  // Réinitialisation des valeurs après ajout
          libelle: '',
          code: '',
          codeclassedocument: '',
          document_class_id: 0,
          documentClass: null,
        };
      },
      (error) => {
        console.error('Error adding document:', error);
      }
    );
  }

  // Mettre à jour un document existant
  updateDocument(): void {
    if (this.selectedDocument) {
      this.documentService.updateDocument(this.selectedDocument.id, this.selectedDocument).subscribe(
        (data) => {
          const index = this.documents.findIndex(doc => doc.id === data.id);
          if (index !== -1) {
            this.documents[index] = data;
          }
          this.selectedDocument = null; // Réinitialiser la sélection
        },
        (error) => {
          console.error('Error updating document:', error);
        }
      );
    }
  }

  // Supprimer un document
  deleteDocument(id: number): void {
    this.documentService.deleteDocument(id).subscribe(
      () => {
        this.documents = this.documents.filter(doc => doc.id !== id);
      },
      (error) => {
        console.error('Error deleting document:', error);
      }
    );
  }
}
