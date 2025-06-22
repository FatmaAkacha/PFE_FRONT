import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DocumentService } from 'src/app/demo/service/document.service';
import { PanierService } from 'src/app/demo/service/panier.service';
import { MagasinierService } from 'src/app/demo/service/magasinier.service';
import { Document } from 'src/app/demo/domain/document';
import { DocumentClass } from 'src/app/demo/domain/documentClass';
import { Fournisseur } from 'src/app/demo/domain/fournisseur';
import { Produit } from 'src/app/demo/domain/produit';
import { Magasinier } from 'src/app/demo/domain/magasinier';
import { DevisProduit } from 'src/app/demo/domain/devis';

@Component({
  selector: 'app-bon-reception',
  templateUrl: './bon-reception.component.html',
  styleUrls: ['./bon-reception.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class BonReceptionComponent implements OnInit {
  num_seq: string = '00001';
  formattedOrderNumber: string = '';
  bonReceptionForm: FormGroup;
  selectedFournisseur: Fournisseur = {} as Fournisseur;
  magasiniers: Magasinier[] = [];
  bonReceptionProduits: DevisProduit[] = [];
  documentClasses: DocumentClass[] = [];
  savedDoc: Document | null = null;
  tva = 19;
  totalHT = 0;
  totalTTC = 0;
  currentDate: Date = new Date();
  id: string | null = null;

  etatOptions: string[] = ['En cours', 'Validé', 'Annulé'];
  deviseOptions = [
    { label: 'Dinar Tunisien (DT)', value: 'TND' },
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Dollar ($)', value: 'USD' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private documentService: DocumentService,
    private panierService: PanierService,
    private magasinierService: MagasinierService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdRef: ChangeDetectorRef
  ) {
    this.bonReceptionForm = this.fb.group({
      dateDocument: [new Date()],
      etat: ['En cours'],
      preparateur_id: [null],
      devise: ['TND'],
      tauxEchange: [1],
      dateLivraison: [new Date()],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.id = params.get('id');
      if (this.id) {
        this.loadDocument(this.id);
      }
    });

    sessionStorage.setItem('codeClasseDoc', 'BR');
    this.loadMagasiniers();
    this.getDocumentClassesAndLoadNextCode();

    // Charger les produits du panier si nécessaire
    const produitsDuPanier = this.panierService.getProduitsCommandes();
    produitsDuPanier.forEach((produit) => {
      this.bonReceptionProduits.push({
        produit,
        quantite: produit.quantity,
        prixTotal: produit.quantity * produit.prix * (1 + produit.tva / 100),
        puht: produit.prix,
        tva: produit.tva,
      });
    });
    this.calculerTotal();
  }

  loadDocument(id: string) {
    this.documentService.getDocumentByIdAndCode(id, 'BCF').subscribe({
      next: (doc: any) => {
        this.savedDoc = doc;
        console.log('document:', doc);
        this.selectedFournisseur = doc.fournisseur;
        this.bonReceptionProduits = doc.lignesDocument.map((ligne: any) => ({
          produit: {
            id: ligne.produit_id,
            nom: ligne.designation,
            prix: ligne.puht,
            quantitystock: ligne.stock,
            tva: ligne.tva,
          },
          quantite: ligne.quantite,
          prixTotal: ligne.ttc,
          puht: ligne.puht,
          tva: ligne.tva,
        }));
        this.bonReceptionForm.patchValue({
          dateDocument: new Date(doc.dateDocument),
          etat: doc.etat,
          preparateur_id: doc.preparateur_id,
          devise: doc.devise,
          tauxEchange: doc.tauxEchange,
          dateLivraison: doc.dateLivraison ? new Date(doc.dateLivraison) : new Date(),
        });
        this.formattedOrderNumber = doc.numero;
        this.calculerTotal();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger le bon de commande fournisseur.',
        });
      },
    });
  }

  loadMagasiniers() {
    this.magasinierService.getMagasiniers().subscribe({
      next: (data: Magasinier[]) => {
        this.magasiniers = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des magasiniers:', err);
      },
    });
  }

  getDocumentClassesAndLoadNextCode() {
    this.documentService.getDocumentClasses().subscribe({
      next: (classes: DocumentClass[]) => {
        this.documentClasses = classes;
        const bonReceptionClass = classes.find((dc) =>
          dc.prefix?.toLowerCase().includes('bon de réception')
        );
        if (bonReceptionClass) {
          this.documentService.getDernierCodeDocumentParClasse('BR').subscribe({
            next: (dernierCode: string) => {
              this.formattedOrderNumber = dernierCode;
            },
            error: () => {
              this.num_seq = '00001';
              this.formattedOrderNumber = '00001';
            },
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des classes de document:', err);
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

  onMagasinierSelect(magasinierId: string) {
    const magasinier = this.magasiniers.find((m) => m.id === magasinierId);
    if (magasinier) {
      this.bonReceptionForm.patchValue({ preparateur_id: magasinier.id });
    }
  }

  calculerTotal() {
    this.totalHT = this.bonReceptionProduits.reduce(
      (sum, p) => sum + p.quantite * p.puht,
      0
    );
    this.totalTTC = this.bonReceptionProduits.reduce((sum, p) => sum + p.prixTotal, 0);
  }

  ajouterProduit(produit: Produit, quantite: number) {
    const produitExistant = this.bonReceptionProduits.find((p) => p.produit.id === produit.id);
    if (produitExistant) {
      produitExistant.quantite += quantite;
      produitExistant.prixTotal = produitExistant.quantite * produit.prix * (1 + produit.tva / 100);
    } else {
      this.bonReceptionProduits.push({
        produit,
        quantite,
        prixTotal: quantite * produit.prix * (1 + produit.tva / 100),
        puht: produit.prix,
        tva: produit.tva,
      });
    }
    this.calculerTotal();
  }

  supprimerProduit(produit: DevisProduit) {
    this.bonReceptionProduits = this.bonReceptionProduits.filter((p) => p !== produit);
    this.calculerTotal();
  }

  modifierProduit(produit: DevisProduit) {
    const quantite = prompt('Modifier la quantité', produit.quantite.toString());
    if (quantite) {
      const newQuantite = parseInt(quantite, 10);
      produit.quantite = newQuantite;
      produit.prixTotal = produit.quantite * produit.produit.prix * (1 + produit.tva / 100);
      this.calculerTotal();
      this.messageService.add({
        severity: 'info',
        summary: 'Modification',
        detail: 'Produit modifié',
      });
    }
  }
  updatePrixTotal(index: number) {
    const produit = this.bonReceptionProduits[index];
    if (produit.quantite > 0) {
        produit.prixTotal = produit.quantite * produit.puht * (1 + produit.tva / 100);
    } else {
        produit.prixTotal = 0;
    }
    this.calculerTotal();
    this.cdRef.detectChanges();
}

  saveBonDeReceptionAsDocument() {
    const libelle = 'Bon de réception';
    const classId = this.getDocumentClassIdByLabel(libelle);

    if (!classId || !this.selectedFournisseur) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Données manquantes',
        detail: 'Veuillez vérifier les informations du fournisseur.',
      });
      return;
    }

    const document: Document = {
      id: 0,
      document_class_id: classId,
      codeclassedocument: 'BR',
      libelle: libelle,
      code: '',
      numero: this.formattedOrderNumber,
      dateDocument:
        this.bonReceptionForm.value.dateDocument?.toISOString() ||
        new Date().toISOString(),
      etat: this.bonReceptionForm.value.etat || 'En cours',
      preparateur_id: this.bonReceptionForm.value.preparateur_id,
      fournisseur_id: this.selectedFournisseur.id,
      client_id: null,
      devise: this.bonReceptionForm.value.devise,
      tauxEchange: this.bonReceptionForm.value.tauxEchange,
      dateLivraison:
        this.bonReceptionForm.value.dateLivraison?.toISOString() ||
        new Date().toISOString(),
      produitsCommandes: this.bonReceptionProduits.map((p) => ({
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
        const savedDoc: Document = response.data;
        this.savedDoc = savedDoc;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Bon de réception enregistré sous le code ${savedDoc.code}`,
        });
        this.formattedOrderNumber = savedDoc.code;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Échec de l'enregistrement du bon de réception.`,
        });
      },
    });
  }

  validerEtPasserAFacture() {
    this.saveBonDeReceptionAsDocument();
  }

  redirigerVersFacture() {
    if (!this.savedDoc?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "Le bon de réception n'est pas encore enregistré ou l'ID est manquant.",
      });
      return;
    }
    this.router.navigate(['/achat/facture', this.savedDoc.id]);
  }

  imprimerDevis() {
    
    window.open(`http://localhost:8000/api/document/${this.savedDoc['data'].id}/facture-pdf`, '_blank');
  }
}