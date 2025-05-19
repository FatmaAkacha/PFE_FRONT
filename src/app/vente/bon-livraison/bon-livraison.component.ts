import { Component, OnInit } from '@angular/core';
import { DocumentClass } from 'src/app/demo/domain/documentClass';
import { Document } from 'src/app/demo/domain/document';
import { DocumentService } from 'src/app/demo/service/document.service';
import { MessageService } from 'primeng/api';
import { PanierService } from 'src/app/demo/service/panier.service';
import { Produit } from 'src/app/demo/domain/produit';
import { Client } from 'src/app/demo/domain/client';
import { User } from 'src/app/demo/domain/user';

@Component({
  selector: 'app-bon-livraison',
  templateUrl: './bon-livraison.component.html',
  styleUrls: ['./bon-livraison.component.scss'],
  providers: [MessageService]
})
export class BonLivraisonComponent implements OnInit {

  devis = {
    dateLivraison: new Date(),
    preparateur_id: {} as User,
    devise: 'TND',
    tauxEchange: 1
  };

  documentClasses: DocumentClass[] = [];
  selectedClient: Client | null = null;

  devisProduits: any[] = []; // ou utilise ProduitCommande[] si tu as une interface dédiée

  constructor(
    private documentService: DocumentService,
    private messageService: MessageService,
    private panierService: PanierService
  ) {}

  ngOnInit() {
    this.getDocumentClassesAndLoadNextCode();
    this.devisProduits = this.panierService.getProduitsCommandes(); // structure : { produit, quantite, prixTotal }
  }

  getDocumentClassesAndLoadNextCode() {
    this.documentService.getDocumentClasses().subscribe(classes => {
      this.documentClasses = classes;
      const bonDeLivraison = classes.find(dc =>
        dc.prefix?.toLowerCase() === 'bon de livraison'
      );

      if (bonDeLivraison) {
        this.documentService.getDernierCodeDocumentParClasse(bonDeLivraison.id).subscribe(code => {
          // sessionStorage.setItem('codeClasseDoc', code);
        });
      }
    });
  }

  getDocumentClassIdByLabel(libelle: string): number | undefined {
    return this.documentClasses.find(dc => dc.prefix?.toLowerCase() === libelle.toLowerCase())?.id;
  }

  saveBonDeLivraisonAsDocument() {
    const libelle = 'Bon de livraison';
    const classId = this.getDocumentClassIdByLabel(libelle);
  
    if (!classId) {
      console.error(`Classe de document '${libelle}' non trouvée.`);
      return;
    }
  
    const document: Document = {
      id: 0,
      document_class_id: classId,
      codeclassedocument: sessionStorage.getItem('codeClasseDoc') || '',
      libelle: 'Bon de livraison',
      code: '',
      numero:'',
      dateDocument: this.devis.dateLivraison?.toISOString(),
      etat: 'Livré',
      preparateur_id: this.devis.preparateur_id,
      client_id: this.selectedClient?.id,
      devise: this.devis.devise,
      tauxEchange: this.devis.tauxEchange,
      dateLivraison: this.devis.dateLivraison?.toISOString(),
      produitsCommandes: this.devisProduits.map(p => ({
        produit_id: p.id,
        quantite: p.quantite,
        prixTotal: p.prix_vente_ht! * p.quantite!
      })),
      documentClass: { id: classId, libelle: '', prefix: '', isachat: false, isvent: false, actif: true }
    };
  
    this.documentService.saveDocument(document).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Bon de livraison enregistré avec succès.'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de l’enregistrement du bon de livraison.'
        });
      }
    });
  }

  transformerEnFacture() {
    // À adapter selon ta logique métier
    console.log("Transformation du bon de livraison en facture en cours...");
  
    // Exemple : changer la classe de document et appeler saveDocument à nouveau avec un autre type
    const factureClassId = this.getDocumentClassIdByLabel('Facture');
    if (!factureClassId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Classe "Facture" introuvable.'
      });
      return;
    }
  
    const facture: Document = {
      id: 0,
      document_class_id: factureClassId,
      codeclassedocument: '...', // à générer ou récupérer via un service
      libelle: 'Facture',
      code: '',
      numero:'',
      dateDocument: new Date().toISOString(),
      etat: 'Validé',
      preparateur_id: this.devis.preparateur_id,
      client_id: this.selectedClient?.id,
      devise: this.devis.devise,
      tauxEchange: this.devis.tauxEchange,
      dateLivraison: this.devis.dateLivraison?.toISOString(),
      produitsCommandes: this.devisProduits.map(p => ({
        produit_id: p.id,
        quantite: p.quantite,
        prixTotal: p.prix_vente_ht! * p.quantite!
      })),
      documentClass: { id: factureClassId, libelle: '', prefix: '', isachat: false, isvent: true, actif: true }
    };
  
    this.documentService.saveDocument(facture).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Facture générée avec succès.'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Échec de la génération de la facture.'
        });
      }
    });
  }
  
  
}