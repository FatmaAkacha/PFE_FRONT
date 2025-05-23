import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../demo/service/document.service';
import { Document } from '../demo/domain/document';
import { DocumentClass } from '../demo/domain/documentClass';
import { MessageService } from 'primeng/api';
import { Client } from '../demo/domain/client';
import { User } from '../demo/domain/user';
import { UserService } from '../demo/service/user.service';
import { DataService } from '../demo/service/data.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  providers: [MessageService]
})
export class DocumentComponent implements OnInit {
  documents: Document[] = [];
  documentClasses: DocumentClass[] = [];
  selectedDocuments: Document[] = [];
  document: Document = this.getEmptyDocument();
  selectedDocumentClassId: number | null = null;

  documentDialog: boolean = false;
  documentClassesDialog: boolean = false; 
  submitted: boolean = false;
  clients: Client[] = [];
  utilisateurs: User[] = [];


  constructor(
    private documentService: DocumentService, 
    private messageService: MessageService ,
    private userService: UserService,
    private clientService: DataService) {}

    ngOnInit(): void {
      this.loadDocumentClasses();
      this.clientService.getClients().subscribe(c => {
        this.clients = c;
        this.loadDocuments();
      });
    
      this.userService.getUsers().subscribe(u => this.utilisateurs = u);
    }
    
  documentClass: DocumentClass = this.getEmptyDocumentClass();
  getEmptyDocumentClass(): DocumentClass {
    return {
      id: 0,
      libelle: '',
      prefix: '',
      isvent: false,
      isachat: false,
      actif: true
    };
  }
  


  getEmptyDocument(): Document {
    return {
      id: 0,
      document_class_id: 0,
      codeclassedocument: '',
      num_seq: '',
      libelle: '',
      code: '',
      dateDocument: '',
      etat: '',
      preparateur_id: {} as User,
      client_id: null,
      devise: '',
      tauxEchange: 0,
      dateLivraison: '',
      produitsCommandes: [],
      documentClass: null,
      numero:'',
    };
  }

  loadDocuments(): void {
    this.documentService.getDocuments().subscribe({
      next: (data) => {
        this.documents = data.map(doc => {
          const client = this.clients.find(c => c.id === doc.client_id);
          const preparateur = this.utilisateurs.find(u => u.id === doc.preparateur_id);
          return {
            ...doc,
            clientNom: client ? client.nom : null,
            preparateurNom: preparateur ? preparateur.username : null

          };
        });
      },
      error: (err) => console.error('Erreur chargement documents', err)
    });
  }
  

  loadDocumentClasses(): void {
    this.documentService.getDocumentClasses().subscribe({
      next: (data) => this.documentClasses = data,
      error: (err) => console.error('Erreur chargement classes', err)
    });
  }

  openNew(): void {
    this.document = this.getEmptyDocument();
    this.submitted = false;
    this.documentDialog = true;
  }

  editDocument(doc: Document): void {
    this.document = { ...doc };
    this.documentDialog = true;
  }

  deleteDocument(doc: Document): void {
    this.documentService.deleteDocument(doc.id).subscribe(() => {
      this.documents = this.documents.filter(d => d.id !== doc.id);
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Document supprimé' });
    });
  }

  deleteSelectedDocuments(): void {
    this.selectedDocuments.forEach(d => this.deleteDocument(d));
    this.selectedDocuments = [];
  }

  saveDocument(): void {
    this.submitted = true;

    if (this.document.id === 0) {
      this.documentService.saveDocument(this.document).subscribe({
        next: (data) => {
          this.documents.push(data);
          this.messageService.add({ severity: 'success', summary: 'Ajouté', detail: 'Document ajouté' });
          this.documentDialog = false;
          this.document = this.getEmptyDocument();
        }
      });
    } else {
      this.documentService.updateDocument(this.document.id, this.document).subscribe({
        next: (data) => {
          const index = this.documents.findIndex(doc => doc.id === data.id);
          if (index !== -1) this.documents[index] = data;
          this.messageService.add({ severity: 'success', summary: 'Mis à jour', detail: 'Document mis à jour' });
          this.documentDialog = false;
        }
      });
    }
  }

  hideDialog(): void {
    this.documentDialog = false;
    this.submitted = false;
  }
// Ouvrir le Dialog des Classes de Documents
showDocumentClassesDialog(): void {
  this.documentClass = this.getEmptyDocumentClass();
  this.documentClassesDialog = true;
}

// Fermer le Dialog des Classes de Documents
closeDocumentClassesDialog(): void {
  this.documentClassesDialog = false;
}

// Ajouter une nouvelle classe de document (logique à personnaliser selon l'API)
addDocumentClass(docClass: DocumentClass): void {
  this.messageService.add({ severity: 'info', summary: 'Classe ajoutée', detail: docClass.libelle });
  this.closeDocumentClassesDialog();  // Fermer le dialog
  // Vous pouvez aussi ajouter de la logique pour gérer l'ajout à la liste ou une autre action
}
saveDocumentClass(): void {
  // Ajoute ici l'appel à ton service pour enregistrer
  this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Classe enregistrée' });
  this.closeDocumentClassesDialog();
}


}
