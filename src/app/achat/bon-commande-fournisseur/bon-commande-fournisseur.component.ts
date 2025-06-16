import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DocumentService } from 'src/app/demo/service/document.service';
import { PanierService } from 'src/app/demo/service/panier.service';
import { Router } from '@angular/router';
import { Produit } from 'src/app/demo/domain/produit';
import { DocumentClass } from 'src/app/demo/domain/documentClass';
import { Document } from 'src/app/demo/domain/document';
import { Fournisseur } from 'src/app/demo/domain/fournisseur';
import { DataService } from 'src/app/demo/service/data.service';
import { DevisProduit } from 'src/app/demo/domain/devis';
import { MagasinierService } from 'src/app/demo/service/magasinier.service';
import { Magasinier } from 'src/app/demo/domain/magasinier';
import { CategorieService } from 'src/app/demo/service/categorie.service';

@Component({
  selector: 'app-bon-commande-fournisseur',
  templateUrl: './bon-commande-fournisseur.component.html',
  styleUrls: ['./bon-commande-fournisseur.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class BonCommandeFournisseurComponent implements OnInit {
  num_seq: string = '00001';
  formattedOrderNumber: string = '';
  bonCommandeDialog: boolean = false;
  bonCommandeForm: FormGroup;
  fournisseurs: Fournisseur[] = [];
  selectedFournisseur: Fournisseur = {} as Fournisseur;
  magasiniers: Magasinier[] = [];
  produitsDansCommande: Produit[] = [];
  produitsClient: Produit[] = [];
  devisProduits: DevisProduit[] = [];
  tva = 19;
  totalHT = 0;
  totalTTC = 0;
  documentClasses: DocumentClass[] = [];
  bonDeCommandeFournisseurClassId: number = 0;
  tauxEchange: number = 1;
  dateLivraison: Date = new Date();
  currentDate: Date = new Date();
  savedDoc: Document;
  categories: any[] = [];
  afficherDialogProduit: boolean = false;
displayAjoutProduitModal: boolean = false;


  etatOptions: string[] = ['En attente', 'Validé', 'Rejeté'];
  deviseOptions = [
    { label: 'Dinar Tunisien (DT)', value: 'TND' },
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Dollar ($)', value: 'USD' },
  ];

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private categorieService : CategorieService,
    private documentService: DocumentService,
    private panierService: PanierService,
    private router: Router,
    private magasinierService: MagasinierService,
    private cdRef: ChangeDetectorRef
  ) {
    this.bonCommandeForm = this.fb.group({
      fournisseur_id: [null],
      dateDocument: [new Date()],
      dateLivraison: [new Date()],
      devise: ['TND'],
      tauxEchange: [1],
      preparateur_id: [null],
      etat: ['En attente'],
    });
  }

  ngOnInit(): void {
    sessionStorage.setItem('codeClasseDoc', 'BCF');
    this.getDocumentClassesAndLoadNextCode();
    this.loadFournisseurs();
    this.loadProduits();
    this.loadMagasiniers();
    this.loadProduitsDuPanier();
    this.getCategories();
  }

    getCategories() {
    this.categorieService.getCategories().subscribe((data) => {
      this.categories = data;
    });
  }


  loadFournisseurs() {
    this.dataService.getFournisseurs().subscribe((data) => {
      this.fournisseurs = data;
    });
  }

  loadProduits() {
    this.dataService.getProduits().subscribe((data) => {
      this.produitsDansCommande = data;
      this.produitsClient = data;
    });
  }

  loadMagasiniers() {
    this.magasinierService.getMagasiniers().subscribe({
      next: (data: Magasinier[]) => (this.magasiniers = data),
      error: (err) => console.error('Erreur chargement magasiniers', err),
    });
  }

loadProduitsDuPanier() {
  const produitsDuPanier = this.panierService.getProduitsCommandes();
  this.devisProduits = produitsDuPanier.map((produit) => ({
    produit,
    quantite: produit.quantite || 1,
    puht: produit.prix_achat || produit.prix || 0,
    tva: produit.tva || this.tva,
    prixTotal: (produit.quantite || 1) * (produit.prix_achat || produit.prix || 0) * (1 + (produit.tva || this.tva) / 100),
  }));
  this.calculerTotal();
  this.cdRef.detectChanges(); // Forcer la mise à jour de la vue
}

  getDocumentClassesAndLoadNextCode() {
    this.documentService.getDocumentClasses().subscribe({
      next: (classes: DocumentClass[]) => {
        this.documentClasses = classes;
        const bonDeCommandeFournisseur = classes.find((dc) =>
          dc.prefix?.toLowerCase().includes('fournisseur')
        );

        if (bonDeCommandeFournisseur) {
          this.bonDeCommandeFournisseurClassId = bonDeCommandeFournisseur.id;
          this.documentService
            .getDernierCodeDocumentParClasse('BCF')
            .subscribe({
              next: (dernierCode: string) => {
                this.formattedOrderNumber = dernierCode || '00001';
              },
              error: () => {
                this.num_seq = '00001';
                this.formattedOrderNumber = '00001';
              },
            });
        } else {
          console.error(
            "Classe de document 'Bon de commande fournisseur' non trouvée."
          );
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des classes de document :', err);
      },
    });
  }

  getDocumentClassIdByLabel(label: string): number | null {
    const lowerLabel = label.toLowerCase().trim();
    const docClass = this.documentClasses.find((dc) =>
      dc.prefix?.toLowerCase().trim().includes(lowerLabel)
    );
    return docClass ? docClass.id : null;
  }

  onFournisseurSelect(fournisseurId: number) {
    const fournisseur = this.fournisseurs.find((f) => f.id === fournisseurId);
    if (fournisseur) {
      this.selectedFournisseur = fournisseur;
      this.bonCommandeForm.patchValue({ fournisseur_id: fournisseur.id });
    }
  }

  onMagasinierSelect(magasinierId: string) {
    const magasinier = this.magasiniers.find((m) => m.id === magasinierId);
    if (magasinier) {
      this.bonCommandeForm.patchValue({ preparateur_id: magasinier.id });
    }
  }

  ajouterProduit(produit: Produit, quantite: number) {
    const produitExistant = this.devisProduits.find(
      (p) => p.produit.id === produit.id
    );

    if (produitExistant) {
      produitExistant.quantite += quantite;
      produitExistant.prixTotal =
        produitExistant.quantite *
        produitExistant.puht *
        (1 + produitExistant.tva / 100);
    } else {
      this.devisProduits.push({
        produit,
        quantite,
        prixTotal: quantite * produit.prix * (1 + produit.tva / 100),
        puht: produit.prix,
        tva: produit.tva || this.tva,
      });
    }

    this.calculerTotal();
  }

  supprimerProduit(produit: DevisProduit) {
    this.devisProduits = this.devisProduits.filter((p) => p !== produit);
    this.calculerTotal();
  }

  calculerTotal() {
    this.totalHT = this.devisProduits.reduce(
      (sum, p) => sum + p.quantite * p.puht,
      0
    );
    this.totalTTC = this.devisProduits.reduce((sum, p) => sum + p.prixTotal, 0);
  }

  modifierProduit(produit: DevisProduit) {
    const quantite = prompt('Modifier la quantité', produit.quantite.toString());
    if (quantite) {
      const newQuantite = parseInt(quantite, 10);
      produit.quantite = newQuantite;
      produit.prixTotal =
        produit.quantite * produit.puht * (1 + produit.tva / 100);
      this.calculerTotal();
      this.messageService.add({
        severity: 'info',
        summary: 'Modification',
        detail: 'Produit modifié',
      });
    }
  }

  mettreAJourProduit(produit: DevisProduit) {
    produit.prixTotal = produit.quantite * produit.puht * (1 + produit.tva / 100);
    this.calculerTotal();
  }

saveBonDeCommandeAsDocument() {
  const libelle = 'Bon de commande fournisseur';
  const classId = this.getDocumentClassIdByLabel(libelle);

  if (!classId || !this.selectedFournisseur) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Données manquantes',
      detail: 'Veuillez sélectionner un fournisseur.',
    });
    return;
  }

  const document: Document = {
    id: 0,
    document_class_id: classId,
    codeclassedocument: 'BCF',
    libelle: libelle,
    code: '',
    numero: '',
    dateDocument:
      this.bonCommandeForm.value.dateDocument?.toISOString() ||
      new Date().toISOString(),
    etat: this.bonCommandeForm.value.etat || 'En attente',
    preparateur_id: this.bonCommandeForm.value.preparateur_id,
    fournisseur_id: this.selectedFournisseur.id,
    client_id: null,
    devise: this.bonCommandeForm.value.devise,
    tauxEchange: this.bonCommandeForm.value.tauxEchange,
    dateLivraison:
      this.bonCommandeForm.value.dateLivraison?.toISOString() ||
      new Date().toISOString(),
    produitsCommandes: this.devisProduits.map((p) => ({
      produit_id: p.produit.id,
      quantite: p.quantite,
      prixTotal: p.prixTotal,
      puht: p.puht,
      tva: p.tva,
    })),
    documentClass: { id: classId } as DocumentClass,
  };

  this.documentService.saveDocument(document).subscribe({
    next: (response: any) => {
      // Extraire la propriété 'data' manuellement
      const savedDoc: Document = response.data;
      this.savedDoc = savedDoc;
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: `Bon de commande fournisseur enregistré sous le code ${savedDoc.code}`,
      });
      this.formattedOrderNumber = savedDoc.code;
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


validerEtPasserAReception() {
  this.saveBonDeCommandeAsDocument();
  setTimeout(() => {
    if (this.savedDoc?.id) {
      this.router.navigate(['/achat/bon-reception', this.savedDoc.id]);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Aucun ID de document disponible pour la navigation.',
      });
    }
  }, 2000);
}

  imprimerBonCommande(id: number) {
    if (id === 0) {
      this.saveBonDeCommandeAsDocument();
      return;
    }
    window.open(`http://localhost:8000/api/documents/${id}/print`, '_blank');
  }

  naviguerVersAjoutProduit() {
  this.displayAjoutProduitModal = true;
}

ajouterProduitApresAjoutModal(produit: Produit) {
  const produitAjoute: DevisProduit = {
    produit: produit,
    quantite: 1,
    puht: produit.prix_achat || produit.prix || 0,
    tva: produit.tva || this.tva,
    prixTotal: (produit.prix_achat || produit.prix || 0) * (1 + (produit.tva || this.tva) / 100),
  };

  this.devisProduits.push(produitAjoute);
  this.calculerTotal();

  this.messageService.add({
    severity: 'success',
    summary: 'Produit ajouté',
    detail: `Le produit "${produit.nom}" a été ajouté au bon de commande.`,
  });
}



}