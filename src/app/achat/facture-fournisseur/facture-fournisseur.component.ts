import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DocumentService } from 'src/app/demo/service/document.service';
import { PanierService } from 'src/app/demo/service/panier.service';
import { MagasinierService } from 'src/app/demo/service/magasinier.service';
import { Document } from 'src/app/demo/domain/document';
import { DocumentClass } from 'src/app/demo/domain/documentClass';
import { Fournisseur } from 'src/app/demo/domain/fournisseur';
import { DevisProduit } from 'src/app/demo/domain/devis';
import { Magasinier } from 'src/app/demo/domain/magasinier';
import { Produit } from 'src/app/demo/domain/produit';

@Component({
  selector: 'app-facture-fournisseur',
  templateUrl: './facture-fournisseur.component.html',
  styleUrls: ['./facture-fournisseur.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class FactureFournisseurComponent implements OnInit {
  num_seq: string = '00001';
    formattedOrderNumber: string = '';
    FactureForm: FormGroup;
    selectedFournisseur: Fournisseur = {} as Fournisseur;
    magasiniers: Magasinier[] = [];
    FactureProduits: DevisProduit[] = [];
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
      this.FactureForm = this.fb.group({
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
  
      sessionStorage.setItem('codeClasseDoc', 'FF');
      this.loadMagasiniers();
      this.getDocumentClassesAndLoadNextCode();
  
      // Charger les produits du panier si nécessaire
      const produitsDuPanier = this.panierService.getProduitsCommandes();
      produitsDuPanier.forEach((produit) => {
        this.FactureProduits.push({
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
          this.selectedFournisseur = doc.fournisseur;
          this.FactureProduits = doc.lignesDocument.map((ligne: any) => ({
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
          this.FactureForm.patchValue({
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
          const FactureClass = classes.find((dc) =>
            dc.prefix?.toLowerCase().includes('Facture Fournisseur')
          );
          if (FactureClass) {
            this.documentService.getDernierCodeDocumentParClasse('FF').subscribe({
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
        this.FactureForm.patchValue({ preparateur_id: magasinier.id });
      }
    }
  
    calculerTotal() {
      this.totalHT = this.FactureProduits.reduce(
        (sum, p) => sum + p.quantite * p.puht,
        0
      );
      this.totalTTC = this.FactureProduits.reduce((sum, p) => sum + p.prixTotal, 0);
    }
  
    ajouterProduit(produit: Produit, quantite: number) {
      const produitExistant = this.FactureProduits.find((p) => p.produit.id === produit.id);
      if (produitExistant) {
        produitExistant.quantite += quantite;
        produitExistant.prixTotal = produitExistant.quantite * produit.prix * (1 + produit.tva / 100);
      } else {
        this.FactureProduits.push({
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
      this.FactureProduits = this.FactureProduits.filter((p) => p !== produit);
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
  
    saveFactureAsDocument() {
      const libelle = 'Facture Fournisseur';
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
        codeclassedocument: 'FF',
        libelle: libelle,
        code: '',
        numero: this.formattedOrderNumber,
        dateDocument:
          this.FactureForm.value.dateDocument?.toISOString() ||
          new Date().toISOString(),
        etat: this.FactureForm.value.etat || 'En cours',
        preparateur_id: this.FactureForm.value.preparateur_id,
        fournisseur_id: this.selectedFournisseur.id,
        client_id: null,
        devise: this.FactureForm.value.devise,
        tauxEchange: this.FactureForm.value.tauxEchange,
        dateLivraison:
          this.FactureForm.value.dateLivraison?.toISOString() ||
          new Date().toISOString(),
        produitsCommandes: this.FactureProduits.map((p) => ({
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
            detail: `Facture Fournisseur enregistré sous le code ${savedDoc.code}`,
          });
          this.formattedOrderNumber = savedDoc.code;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: `Échec de l'enregistrement du facture Fournisseur.`,
          });
        },
      });
    }
  
  
    imprimerFacture(id: number | string) {
      if (!id) {
        this.saveFactureAsDocument();
        return;
      }
      window.open(`http://localhost:8000/api/documents/${id}/print`, '_blank');
    }
  }