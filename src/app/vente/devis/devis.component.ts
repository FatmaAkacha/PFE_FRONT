import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DevisService } from 'src/app/demo/service/devis.service';
import { Client } from 'src/app/demo/domain/client';
import { Produit } from 'src/app/demo/domain/produit';
import { Devis, DevisProduit } from 'src/app/demo/domain/devis';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Router } from '@angular/router';
import { DocumentService } from 'src/app/demo/service/document.service';
import { Document } from 'src/app/demo/domain/document';
import { DocumentClass } from 'src/app/demo/domain/documentClass';
import { PanierService } from 'src/app/demo/service/panier.service';


@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class DevisComponent implements OnInit {
  devisDialog: boolean = false;
  devisList: Devis[] = [];
  devisForm: FormGroup;
  client: Client;
  clients: Client[] = [];
  produitsDansCommande: Produit[] = [];
  produitsClient: Produit[] = [];
  devisProduits: DevisProduit[] = [];
  tva = 20;
  totalHT = 0;
  totalTTC = 0;
  selectedClient: Client = {} as Client;
  clientDevis: Devis[] = [];
  currentOrderNumber: number = 1;
  formattedOrderNumber: string = '';
  currentDate: Date = new Date(); 
  afficherProduits: boolean = false;
  documentClasses: DocumentClass[] = [];
  bonDeCommandeClassId: number = 0;
  tauxEchange: number = 1;
  totalStock: number = 0;
  dateLivraison: Date = new Date();

  etatOptions: string[] = ['En cours', 'Validé', 'Annulé']; 
  preparateurs = [{ nom: 'John Doe' }, { nom: 'Jane Doe' }];
  deviseOptions = [
    { label: 'Dinar Tunisien (DT)', value: 'TND' },
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Dollar ($)', value: 'USD' }
  ];
  devis: Devis = {
    client_id: 1, // à adapter dynamiquement
    totalHT: 100,
    tva: 20,
    totalTTC: 120,
    date: new Date().toISOString().slice(0, 10),
    produits: [
      {
        produit: { 
          id: 1, 
          nom: 'Produit A', 
          prix: 50,
          quantitystock: 100,
          seuil: 20,
          categorie: { id: 1, nom: 'Catégorie A' } // ← ici
        },
        quantite: 2,
        prixTotal: 100
      }
    ]
  };

  constructor(
    private fb: FormBuilder,
    private devisService: DevisService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private documentService: DocumentService,
    private panierService: PanierService,
    private router: Router
  ) {
    this.devisForm = this.fb.group({
      client: [null]
    });

    this.devis = {
      id: 0,
      client_id: 0,
      client: {} as Client,
      produits: [],
      totalHT: 0,
      tva: 0,
      totalTTC: 0,
      date: '',
      etat: '', 
      preparateur: '',
      devise: '',          
      tauxEchange: 1,         
      dateLivraison: new Date()
    };
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadProduits(); 
    this.loadDevis();
    this.getDocumentClasses();
  
    // 🔽 Récupération des produits du panier
    const produitsDuPanier = this.panierService.getProduitsCommandes();
    this.produitsDansCommande = produitsDuPanier;
    this.produitsClient = produitsDuPanier;
  
    // 🔥 Intégrer automatiquement dans le bon de commande (devisProduits)
    produitsDuPanier.forEach(produit => {
      this.devisProduits.push({
        produit,
        quantite: produit.quantitystock,
        prixTotal: produit.quantitystock * produit.prix 
      });
    });
  
    // Recalculer les totaux
    this.calculerTotal();
  
    const savedOrderNumber = localStorage.getItem('currentOrderNumber');
    this.currentOrderNumber = savedOrderNumber ? parseInt(savedOrderNumber, 10) : 1;
    this.formatOrderNumber();

    console.log(this.devisProduits);

  }
  getDocumentClasses() {
    this.documentService.getDocumentClasses().subscribe({
      next: (classes: DocumentClass[]) => {
        console.log('Classes de document récupérées:', classes);
        this.documentClasses = classes;
  
        // Rechercher dynamiquement la classe "Bon de commande"
        const bonDeCommande = this.documentClasses.find(dc =>
          dc.prefixe == 'Bon de commande'
        );
  
        if (bonDeCommande) {
          this.bonDeCommandeClassId = bonDeCommande.id;
        } else {
          console.error("Classe de document 'Bon de commande' non trouvée.");
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des classes de document :", err);
      }
    });
  }
  
  downloadBonDeCommande(devisId: number) {
    console.log("Téléchargement du devis avec ID :", devisId); // Vérifie que ce n'est pas 0
    this.devisService.downloadPDF(devisId).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bon_de_commande_${devisId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error("Erreur lors du téléchargement :", err);
      }
    });
  }
   
  //getDocumentClasses() {
   // this.documentService.getDocumentClasses().subscribe({
    //  next: (classes: DocumentClass[]) => {
       // console.log('Classes de document récupérées:', classes);
     //   this.documentClasses = classes;
  
        // Trouver dynamiquement la classe "Bon de commande"
       // const bonDeCommande = this.documentClasses.find(dc =>
         // dc.libelle?.toLowerCase().trim() === 'bon de commande' 
           //    );
  
       //// if (bonDeCommande) {
         // this.bonDeCommandeClassId = bonDeCommande.id;
       // } else {
         // console.error("Classe de document 'Bon de commande' non trouvée.");
       // }
     // },
      //error: (err) => {
      //  console.error("Erreur lors du chargement des classes de document :", err);
     // }
   // });
 // }

 getDocumentClassIdByLabel(label: string): number | null {
  const lowerLabel = label.toLowerCase().trim();
  const docClass = this.documentClasses.find(dc =>
    (dc.libelle && dc.libelle.toLowerCase().trim() === lowerLabel) ||
    (dc.prefixe && dc.prefixe.toLowerCase().trim() === lowerLabel)
  );
  return docClass ? docClass.id : null;
}

  loadClients() {
    this.devisService.getClients().subscribe(data => {
      this.clients = data;
    });
  }

  loadProduits() {
    this.devisService.getProduits().subscribe(data => this.produitsDansCommande = data);
  }

  loadDevis() {
    this.devisService.getDevis().subscribe(data => this.devisList = data);
  }

  openNew() {
    this.devis = {} as Devis;
    this.devisProduits = [];
    this.calculerTotal();
    this.devisDialog = true;
  }

  onClientSelect(client: Client) {
    this.selectedClient = client;
    this.devisForm.patchValue({ client: client.id });
  
    // Charger tous les produits, indépendamment du client sélectionné
    this.produitsClient = this.produitsDansCommande; // Afficher tous les produits
    
    // Calculer la somme du stock total si nécessaire
    this.totalStock = this.produitsClient.reduce((sum, produit) => sum + produit.quantitystock, 0);
  }
  
  ajouterProduit(produit: Produit, quantite: number) {
    console.log('Produit ajouté:', produit);
  
    // Vérifier si la quantité demandée ne dépasse pas le stock disponible
    const produitExistant = this.devisProduits.find(p => p.produit.id === produit.id);
  
    if (produitExistant) {
      const newQuantite = produitExistant.quantite + quantite;
  
      if (newQuantite > produit.quantitystock) {
        this.messageService.add({
          severity: 'error',
          summary: 'Quantité non valide',
          detail: `La quantité demandée dépasse le stock disponible (${produit.quantitystock}).`
        });
        return;
      }
  
      produitExistant.quantite += quantite;
      produitExistant.prixTotal = produitExistant.quantite * produit.prix;
    } else {
      if (quantite > produit.quantitystock) {
        this.messageService.add({
          severity: 'error',
          summary: 'Stock insuffisant',
          detail: `La quantité demandée dépasse le stock disponible pour ce produit.`
        });
        return;
      }
  
      this.devisProduits.push({
        produit,
        quantite,  // Quantité demandée par l'utilisateur
        prixTotal: quantite * produit.prix
      });
    }
  
    this.calculerTotal();
  }
  
  getStockRestant(item: DevisProduit): number {
    return item.produit.quantitystock - item.quantite;
  }
  
  supprimerProduit(produit: DevisProduit) {
    this.devisProduits = this.devisProduits.filter(p => p !== produit);
    this.calculerTotal();
  }

  calculerTotal() {
    this.totalHT = this.devisProduits.reduce((sum, p) => sum + p.prixTotal, 0);
    this.totalTTC = this.totalHT * (1 + this.tva / 100);
  }

  incrementOrderNumber() {
    this.currentOrderNumber++;
    this.formatOrderNumber();
    localStorage.setItem('currentOrderNumber', this.currentOrderNumber.toString());
  }

  formatOrderNumber() {
    this.formattedOrderNumber = ('000000' + this.currentOrderNumber).slice(-6);
  }
  
  
  modifierProduit(produit: DevisProduit) {
    const quantite = prompt('Modifier la quantité', produit.quantite.toString());
    if (quantite) {
      const newQuantite = parseInt(quantite, 10);
  
      // Limiter la quantité à la quantité en stock
      if (newQuantite > produit.produit.quantitystock) {
        this.messageService.add({
          severity: 'error',
          summary: 'Quantité non valide',
          detail: `La quantité demandée dépasse le stock disponible (${produit.produit.quantitystock}).`
        });
        return;
      }
  
      // Vérification du seuil
      if (newQuantite > produit.produit.seuil) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Attention!',
          detail: `Vous avez dépassé le seuil recommandé pour ce produit (${produit.produit.seuil}).`
        });
      }
  
      produit.quantite = newQuantite;
      produit.prixTotal = produit.quantite * produit.produit.prix;
      this.calculerTotal();
      this.messageService.add({ severity: 'info', summary: 'Modification', detail: 'Produit modifié' });
    }
  }
  
  
  voirProduitsCommandes() {
    this.router.navigate(['/vente/produits-commandes'], {
      state: { produits: this.devisProduits.map(d => d.produit) }
    });
  }
  saveBonDeCommandeAsDocument() {
    const label = 'Bon de commande';
    const classId = this.getDocumentClassIdByLabel(label);
    
    if (!classId) {
      console.error(`Classe de document '${label}' non trouvée.`);
      return;
    }
    
    const document: Document = {
      id: 0,
      document_class_id: classId,
      codeclassedocument: 'BC',
      libelle: `Bon de commande`, // Par exemple
      code: '',    // Le backend générera le code
      documentClass: {} as DocumentClass
    };
  
    this.documentService.saveDocument(document).subscribe({
      next: (savedDoc) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Bon de commande enregistré sous le code ${savedDoc.code}`
        });
        this.formattedOrderNumber = savedDoc.code; // Met à jour l'affichage du numéro
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Échec de l'enregistrement du document 'Bon de commande'.`
        });
      }
    });
  }
  
  
  validerEtPasserALivraison() {
    this.saveBonDeCommandeAsDocument();
    this.router.navigate(['vente/bon-livraison/:id']); 
  }

  sauvegarderBonCommande() {
    console.log('Bon de commande validé et sauvegardé');
  } 
  mettreAJourProduit(produit: DevisProduit) {
    if (produit.quantite > produit.produit.quantitystock) {
      this.messageService.add({
        severity: 'error',
        summary: 'Quantité non valide',
        detail: `Quantité maximale disponible : ${produit.produit.quantitystock}`
      });
      produit.quantite = produit.produit.quantitystock;
    }
  
    if (produit.quantite > produit.produit.seuil) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Seuil dépassé',
        detail: `La quantité dépasse le seuil recommandé de ${produit.produit.seuil}.`
      });
    }
  
    // Mise à jour du prix total
    produit.prixTotal = produit.quantite * produit.produit.prix;
  
    this.calculerTotal();
  }
  

}