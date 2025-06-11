import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../demo/service/document.service';
import { Document } from '../demo/domain/document';
import { DocumentClass } from '../demo/domain/documentClass';
import { MessageService } from 'primeng/api';
import { Client } from '../demo/domain/client';
import { User } from '../demo/domain/user';
import { UserService } from '../demo/service/user.service';
import { DataService } from '../demo/service/data.service';
import { Magasinier } from '../demo/domain/magasinier';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  providers: [MessageService]
})
export class DocumentComponent implements OnInit {
  documents: Document[] = [];
  documentClasses: DocumentClass[] = [];
  clients: Client[] = [];
  utilisateurs: User[] = [];

  selectedDocuments: Document[] = [];
  document: Document = this.getEmptyDocument();
  documentClass: DocumentClass = this.getEmptyDocumentClass();

  documentDialog = false;
  documentClassesDialog = false;
  submitted = false;
  showClassForm = false;

  constructor(
    private documentService: DocumentService,
    private messageService: MessageService,
    private userService: UserService,
    private clientService: DataService
  ) {}

  ngOnInit(): void {
    this.loadDocumentClasses();
    this.userService.getUsers().subscribe(u => this.utilisateurs = u);
    this.clientService.getClients().subscribe(c => {
      this.clients = c;
      this.loadDocuments();
    });
  }

  getEmptyDocument(): Document {
    return {
      id: 0,
      document_class_id: 0,
      codeclassedocument: '',
      numero: '',
      libelle: '',
      code: '',
      dateDocument: '',
      etat: '',
      preparateur_id: {} as Magasinier,
      client_id: null,
      devise: '',
      tauxEchange: 0,
      dateLivraison: '',
      produitsCommandes: [],
      documentClass: null,
    };
  }

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

  loadDocuments(): void {
    this.documentService.getDocuments().subscribe({
      next: (data) => {
        this.documents = data.map(doc => ({
          ...doc,
          clientNom: this.clients.find(c => c.id === doc.client_id)?.nom || null,
          preparateurNom: this.utilisateurs.find(u => u.id === doc.preparateur_id)?.username || null
        }));
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

  openNewDocument(): void {
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

    deleteDocumentClasse(classe: Document): void {
    this.documentService.deleteDocument(classe.id).subscribe(() => {
      this.documents = this.documents.filter(d => d.id !== classe.id);
      this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Document supprimé' });
    });
  }

  deleteSelectedDocuments(): void {
    this.selectedDocuments.forEach(doc => this.deleteDocument(doc));
    this.selectedDocuments = [];
  }

  saveDocument(): void {
    this.submitted = true;

    if (!this.document.libelle || !this.document.code) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Libellé et Code sont obligatoires' });
      return;
    }

    const isNew = this.document.id === 0;
    const action = isNew
      ? this.documentService.saveDocument(this.document)
      : this.documentService.updateDocument(this.document.id, this.document);

    action.subscribe({
      next: (savedDoc) => {
        const enrichedDoc = {
          ...savedDoc,
          clientNom: this.clients.find(c => c.id === savedDoc.client_id)?.nom || null,
          preparateurNom: this.utilisateurs.find(u => u.id === savedDoc.preparateur_id)?.username || null
        };

        if (isNew) {
          this.documents.push(enrichedDoc);
          this.messageService.add({ severity: 'success', summary: 'Ajouté', detail: 'Document ajouté' });
        } else {
          const index = this.documents.findIndex(d => d.id === savedDoc.id);
          if (index !== -1) this.documents[index] = enrichedDoc;
          this.messageService.add({ severity: 'success', summary: 'Mis à jour', detail: 'Document mis à jour' });
        }

        this.documentDialog = false;
        this.document = this.getEmptyDocument();
      },
      error: (err) => {
        console.error('Erreur sauvegarde document', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la sauvegarde du document' });
      }
    });
  }

  hideDialog(): void {
    this.documentDialog = false;
    this.submitted = false;
  }

showDocumentClassesDialog(): void {
  this.documentClass = this.getEmptyDocumentClass();
  this.documentClassesDialog = true;
  this.showClassForm = false; // Ne pas afficher le formulaire directement
}

  closeDocumentClassesDialog(): void {
    this.documentClassesDialog = false;
    this.submitted = false;
  }

  saveDocumentClass(): void {
    this.submitted = true;

    if (!this.documentClass.libelle || !this.documentClass.prefix.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Champ requis',
        detail: 'Le libellé est obligatoire'
      });
      return;
    }

    const isNew = this.documentClass.id === 0;

    const action = isNew
      ? this.documentService.saveDocumentClass(this.documentClass)
      : this.documentService.updateDocumentClass(this.documentClass.id, this.documentClass);

    action.subscribe({
      next: (savedClass) => {
        if (isNew) {
          this.documentClasses.push(savedClass);
          this.messageService.add({ severity: 'success', summary: 'Ajoutée', detail: 'Classe de document ajoutée' });
        } else {
          const index = this.documentClasses.findIndex(c => c.id === savedClass.id);
          if (index !== -1) this.documentClasses[index] = savedClass;
          this.messageService.add({ severity: 'success', summary: 'Modifiée', detail: 'Classe de document mise à jour' });
        }

        this.resetDocumentClassForm();
        this.closeDocumentClassesDialog();
      },
      error: (err) => {
        console.error('Erreur enregistrement classe', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'enregistrement de la classe' });
      }
    });
  }

editDocumentClass(classe: DocumentClass): void {
  this.documentClass = { ...classe };
  this.showClassForm = true; // Affiche le formulaire lors de l'édition
}

  confirmDeleteDocumentClass(classe: DocumentClass): void {
    if (!classe.id) return;

    this.documentService.deleteDocumentClass(classe.id).subscribe({
      next: () => {
        this.documentClasses = this.documentClasses.filter(c => c.id !== classe.id);
        this.messageService.add({ severity: 'success', summary: 'Supprimée', detail: 'Classe de document supprimée' });
      },
      error: err => {
        console.error('Erreur suppression classe', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression' });
      }
    });
  }

resetDocumentClassForm(): void {
  this.documentClass = this.getEmptyDocumentClass();
  this.submitted = false;
  this.showClassForm = true; // Affiche le formulaire quand on clique sur "Ajouter une Classe"
}
}
