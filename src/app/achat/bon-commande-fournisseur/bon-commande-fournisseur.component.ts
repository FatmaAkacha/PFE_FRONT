import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DocumentService } from 'src/app/demo/service/document.service';
import { PanierService } from 'src/app/demo/service/panier.service';
import { UserService } from 'src/app/demo/service/user.service';
import { Router } from '@angular/router';
import { Produit } from 'src/app/demo/domain/produit';
import { DocumentClass } from 'src/app/demo/domain/documentClass';
import { Document } from 'src/app/demo/domain/document';
import { User } from 'src/app/demo/domain/user';
import { Fournisseur } from 'src/app/demo/domain/fournisseur';
import { DataService } from 'src/app/demo/service/data.service';

interface DevisProduit {
  produit: Produit;
  quantite: number;
  puht: number;
  tva: number;
  prixTotal: number;
}

@Component({
  selector: 'app-bon-commande-fournisseur',
  templateUrl: './bon-commande-fournisseur.component.html',
  styleUrls: ['./bon-commande-fournisseur.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class BonCommandeFournisseurComponent implements OnInit {
  bonCommandeForm: FormGroup;
  fournisseurs: Fournisseur[] = [];
  selectedFournisseur: Fournisseur | null = null;
  produitsDansCommande: Produit[] = [];
  documentClasses: DocumentClass[] = [];
  devisProduits: DevisProduit[] = [];
commande: any = {}; 
  etatOptions = ['En attente', 'Validé', 'Rejeté']; 
  deviseOptions = ['USD', 'EUR', 'TND']; 
  commandeProduits: any[] = []; 
  formattedOrderNumber = '00001';
  bonDeCommandeFournisseurClassId = 0;

  totalHT = 0;
  totalTTC = 0;

  tvaParDefaut = 19;
  currentDate = new Date();

  users: User[] = [];
  savedDoc!: Document;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private messageService: MessageService,
    private documentService: DocumentService,
    private panierService: PanierService,
    private router: Router,
    private userService: UserService,
    private cdRef: ChangeDetectorRef
  ) {
    this.bonCommandeForm = this.fb.group({
      fournisseur_id: [null],
      dateDocument: [new Date()],
      dateLivraison: [new Date()],
      devise: ['TND'],
      tauxEchange: [1],
      preparateur_id: [null],
      etat: ['En cours'],
    });
  }

  ngOnInit(): void {
    sessionStorage.setItem('codeClasseDoc', 'BCF');
    this.loadFournisseurs();
    this.getDocumentClassesAndLoadNextCode();
    this.loadUsers();
    this.loadProduitsDuPanier();
  }
voirProduitsCommandes() {
    console.log("Produits commandés:", this.commandeProduits);
  }
  loadFournisseurs(): void {
    this.dataService.getFournisseurs().subscribe(data => {
      this.fournisseurs = data;
    });
  }

  loadProduits() {
    this.dataService.getProduits().subscribe(data => {
      this.produitsDansCommande = data;
    });
  }
  
  validerEtPasserAReception(): void {
  console.log('Commande validée et transférée vers la livraison.');
}
imprimerCommande(): void {
  console.log('Commande imprimée');
}


  onFournisseurSelect(fournisseurId: number): void {
    this.selectedFournisseur = this.fournisseurs.find(f => f.id === fournisseurId) || null;
  }

  getDocumentClassesAndLoadNextCode(): void {
    this.documentService.getDocumentClasses().subscribe({
      next: (classes: DocumentClass[]) => {
        this.documentClasses = classes;
        const docClass = classes.find(dc =>
          dc.prefix?.toLowerCase().includes('fournisseur')
        );

        if (docClass) {
          this.bonDeCommandeFournisseurClassId = docClass.id;
          const codeClasse = sessionStorage.getItem('codeClasseDoc')!;
          this.documentService.getDernierCodeDocumentParClasse(codeClasse).subscribe({
            next: (dernierCode: string) => {
              this.formattedOrderNumber = dernierCode || '00001';
            },
            error: () => {
              this.formattedOrderNumber = '00001';
            },
          });
        }
      },
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data: User[]) => (this.users = data),
      error: err => console.error('Erreur chargement users', err),
    });
  }

  loadProduitsDuPanier(): void {
    this.produitsDansCommande = this.panierService.getProduitsCommandes();
    this.devisProduits = this.produitsDansCommande.map(p => ({
      produit: p,
      quantite: p.quantity || 1,
      puht: p.prix || 0,
      tva: p.tva ?? this.tvaParDefaut,
      prixTotal: (p.quantity || 1) * (p.prix || 0) * (1 + (p.tva ?? this.tvaParDefaut) / 100),
    }));

    this.calculerTotal();
  }

  mettreAJourProduit(produit: DevisProduit): void {
    produit.prixTotal = produit.quantite * produit.puht * (1 + produit.tva / 100);
    this.calculerTotal();
  }

  calculerTotal(): void {
    this.totalHT = this.devisProduits.reduce((sum, p) => sum + (p.quantite * p.puht), 0);
    this.totalTTC = this.devisProduits.reduce((sum, p) => sum + p.prixTotal, 0);
  }

  saveBonDeCommandeFournisseurAsDocument(): void {
    const classId = this.bonDeCommandeFournisseurClassId;
    const codeClasse = sessionStorage.getItem('codeClasseDoc');

    if (!classId || !this.selectedFournisseur) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Données manquantes',
        detail: `Veuillez sélectionner un fournisseur.`,
      });
      return;
    }

    const doc: Document = {
      id: 0,
      document_class_id: classId,
      codeclassedocument: codeClasse!,
      libelle: 'Bon de commande fournisseur',
      code: '',
      numero: '',
      dateDocument: this.bonCommandeForm.value.dateDocument.toISOString(),
      etat: this.bonCommandeForm.value.etat,
      preparateur_id: this.bonCommandeForm.value.preparateur_id,
      client_id: this.selectedFournisseur.id,
      devise: this.bonCommandeForm.value.devise,
      tauxEchange: this.bonCommandeForm.value.tauxEchange,
      dateLivraison: this.bonCommandeForm.value.dateLivraison.toISOString(),
      produitsCommandes: this.devisProduits.map(p => ({
        produit_id: p.produit.id,
        quantite: p.quantite,
        puht: p.puht,
        tva: p.tva,
        prixTotal: p.prixTotal,
      })),
      documentClass: { id: classId } as DocumentClass,
    };

    this.documentService.saveDocument(doc).subscribe({
      next: (saved: Document) => {
        this.savedDoc = saved;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Bon de commande fournisseur enregistré sous le code ${saved.code}`,
        });
        this.formattedOrderNumber = saved.code;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Échec de l'enregistrement du bon de commande fournisseur.`,
        });
      },
    });
  }

  imprimerBonCommande(id: number): void {
    if (!id && this.savedDoc) {
      id = this.savedDoc.id;
    }
    if (id) {
      window.open(`http://localhost:8000/api/documents/${id}/print`, '_blank');
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucun document',
        detail: `Veuillez enregistrer le bon de commande avant impression.`,
      });
    }
  }

  naviguerVersAjoutProduit(): void {
  this.router.navigate(['/achat/Produitfournisseur'], {
   state: { produits: this.devisProduits.map(d => d.produit) }
  });
}
}