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
import { MagasinierService } from '../demo/service/magasinier.service';
import { Fournisseur } from '../demo/domain/fournisseur';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
  providers: [MessageService]
})
export class DocumentComponent implements OnInit {
  documents: Document[] = [];
  documentClasses: DocumentClass[] = [];
  clients: Client[] = [];
  utilisateurs: User[] = [];
  magasiniers: Magasinier[] = [];
  fournsisseurs: Fournisseur[] = [];

  selectedDocuments: Document[] = [];
  document: Document = this.getEmptyDocument();
  documentClass: DocumentClass = this.getEmptyDocumentClass();

  documentDialog = false;
  documentClassesDialog = false;
  submitted = false;
  showClassForm = false;

  etatOptions: string[] = ['En attente', 'Validé', 'Rejeté'];
  deviseOptions = [
    { label: 'Dinar Tunisien (DT)', value: 'TND' },
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Dollar ($)', value: 'USD' },
  ];

  constructor(
    private documentService: DocumentService,
    private messageService: MessageService,
    private userService: UserService,
    private clientService: DataService,
    private magasinierService: MagasinierService,
    private fournisseurService: DataService
  ) {}

  ngOnInit(): void {
    this.loadDocumentClasses();
    this.magasinierService.getMagasiniers().subscribe(m => this.magasiniers = m);
    this.clientService.getClients().subscribe(c => {
      this.clients = c;
      this.loadDocuments();
      this.loadMagasiniers();
      this.loadFournisseurs();
    });
  }

  onMagasinierSelect(magasinierId: string) {
    const magasinier = this.magasiniers.find((m) => m.id === magasinierId);
    if (magasinier) {
      this.document.preparateur_id = magasinier;
    }
  }

  onFournisseurSelect(fournisseurId: number) {
    const fournisseur = this.fournsisseurs.find(f => f.id === fournisseurId);
    if (fournisseur) {
      this.document.fournisseur_id = fournisseur.id;
      this.onFournisseurChange();
    }
  }

  onClientSelect(clientId: number) {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      this.document.client_id = client.id;
      this.onClientChange();
    }
  }

  getEmptyDocument(): Document {
    return {
      id: 0,
      document_class_id: 0,
      codeclassedocument: '',
      numero: '',
      num_seq: '',
      libelle: '',
      code: '',
      dateDocument: '',
      etat: '',
      preparateur_id: null,
      client_id: null,
      fournisseur_id: null,
      devise: '',
      tauxEchange: 0,
      dateLivraison: '',
      produitsCommandes: [],
      documentClass: null
    };
  }

  loadMagasiniers() {
    this.magasinierService.getMagasiniers().subscribe({
      next: (data: Magasinier[]) => (this.magasiniers = data),
      error: (err) => console.error('Erreur chargement magasiniers', err),
    });
  }

  loadFournisseurs() {
    this.fournisseurService.getFournisseurs().subscribe({
      next: (data: Fournisseur[]) => (this.fournsisseurs = data),
      error: (err) => console.error('Erreur chargement fournisseur', err),
    });
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
          preparateurNom: this.magasiniers.find(m => m.id === (typeof doc.preparateur_id === 'object' && doc.preparateur_id !== null ? doc.preparateur_id.id : doc.preparateur_id))?.nom || null,
          fournisseurNom: this.fournsisseurs.find(f => f.id === doc.fournisseur_id)?.name || null
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
    this.documentService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.documents = this.documents.filter(d => d.id !== doc.id);
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Document supprimé' });
      },
      error: (err) => console.error('Erreur suppression document', err)
    });
  }

  deleteSelectedDocuments(): void {
    this.selectedDocuments.forEach(doc => this.deleteDocument(doc));
    this.selectedDocuments = [];
  }

  saveDocument(): void {
    this.submitted = true;

    if (!this.document.libelle || !this.document.document_class_id) {
      this.messageService.add({ severity: 'warn', summary: 'Champs requis', detail: 'Libellé et classe de document sont obligatoires' });
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
          preparateurNom: this.magasiniers.find(m => m.id === (typeof savedDoc.preparateur_id === 'object' && savedDoc.preparateur_id !== null ? savedDoc.preparateur_id.id : savedDoc.preparateur_id))?.nom || null,
          fournisseurNom: this.fournsisseurs.find(f => f.id === savedDoc.fournisseur_id)?.name || null
        };

        if (isNew) {
          this.documents.push(enrichedDoc);
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Document ajouté' });
        } else {
          const index = this.documents.findIndex(d => d.id === savedDoc.id);
          if (index !== -1) this.documents[index] = enrichedDoc;
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Document mis à jour' });
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

  isClientSelected(): boolean {
    return !!this.document.client_id;
  }

  isFournisseurSelected(): boolean {
    return !!this.document.fournisseur_id;
  }

  onClientChange(): void {
    if (this.document.client_id) {
      this.document.fournisseur_id = null;
    }
  }

  onFournisseurChange(): void {
    if (this.document.fournisseur_id) {
      this.document.client_id = null;
    }
  }

  hideDialog(): void {
    this.documentDialog = false;
    this.submitted = false;
  }

  showDocumentClassesDialog(): void {
    this.documentClass = this.getEmptyDocumentClass();
    this.documentClassesDialog = true;
    this.showClassForm = false;
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
    this.showClassForm = true;
  }

  confirmDeleteDocumentClass(classe: DocumentClass): void {
    if (!classe.id) return;

    this.documentService.deleteDocumentClass(classe.id).subscribe({
      next: () => {
        this.documentClasses = this.documentClasses.filter(d => d.id !== classe.id);
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Classe de document supprimée' });
      },
      error: (err) => {
        console.error('Erreur suppression classe', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression' });
      }
    });
  }

  resetDocumentClassForm(): void {
    this.documentClass = this.getEmptyDocumentClass();
    this.submitted = false;
    this.showClassForm = true;
  }

  submitForm(docForm: NgForm): void {
    if (docForm.valid) {
      this.saveDocument();
    } else {
      this.submitted = true;
      this.messageService.add({ severity: 'warn', summary: 'Erreur', detail: 'Veuillez remplir tous les champs requis.' });
    }
  }
}