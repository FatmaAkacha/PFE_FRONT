import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DevisService } from 'src/app/demo/service/devis.service';
import { Client } from 'src/app/demo/domain/client';
import { Produit } from 'src/app/demo/domain/produit';
import { Devis, DevisProduit } from 'src/app/demo/domain/devis';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BreadcrumbService } from 'src/app/breadcrumb.service';
import { Router } from '@angular/router';
import { DocumentService } from 'src/app/demo/service/document.service';
import { Document } from 'src/app/demo/domain/document';
import { DocumentClass } from 'src/app/demo/domain/documentClass';
import { PanierService } from 'src/app/demo/service/panier.service';
import { User } from 'src/app/demo/domain/user';
import { UserService } from 'src/app/demo/service/user.service';

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class DevisComponent implements OnInit {
  num_seq: string = '00001';  
  formattedOrderNumber: string = '';
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
  currentDate: Date = new Date(); 
  afficherProduits: boolean = false;
  documentClasses: DocumentClass[] = [];
  bonDeCommandeClassId: number = 0;
  tauxEchange: number = 1;
  totalStock: number = 0;
  dateLivraison: Date = new Date();
  users: User[] = [];
  numero;

  etatOptions: string[] = ['En cours', 'Validé', 'Annulé']; 
  preparateurs = [{ nom: 'John Doe' }, { nom: 'Jane Doe' }];
  deviseOptions = [
    { label: 'Dinar Tunisien (DT)', value: 'TND' },
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Dollar ($)', value: 'USD' }
  ];
  devis: Devis = {
    client_id: "", // à adapter dynamiquement
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
        prixTotal: 100,
        puht:19,
        tva:19
      }
    ]
  };
  savedDoc: Document;

  constructor(
    private fb: FormBuilder,
    private devisService: DevisService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private documentService: DocumentService,
    private panierService: PanierService,
    private router: Router,
    private userService: UserService,
    private breadcrumbService: BreadcrumbService,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef
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
      preparateur_id: {} as User,
      devise: '',          
      tauxEchange: 1,         
      dateLivraison: new Date()
    };
  }

  ngOnInit(): void {

    sessionStorage.setItem('codeClasseDoc', 'BC')
    this.getDocumentClassesAndLoadNextCode();
    this.loadClients();
    this.loadUsers();
    this.loadProduits(); 
    this.loadDevis();
  
    const produitsDuPanier = this.panierService.getProduitsCommandes();
    this.produitsDansCommande = produitsDuPanier;
    this.produitsClient = produitsDuPanier;
  
    produitsDuPanier.forEach(produit => {
      this.devisProduits.push({
        produit,
        quantite: produit.quantity,
        prixTotal: produit.quantity * produit.prix * (1 + produit.tva / 100),
        puht:produit.prix,
        tva:produit.tva

      });
    });
  
    this.calculerTotal();
    console.log(this.devisProduits);
  }
  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
      },
      error: (err) => {
        console.error("Erreur lors du chargement des utilisateurs :", err);
      }
    });
  }
  getDocumentClasses() {
    this.documentService.getDocumentClasses().subscribe({
      next: (classes: DocumentClass[]) => {
        console.log('Classes de document récupérées:', classes);
        this.documentClasses = classes;
  
        const bonDeCommande = this.documentClasses.find(dc =>
          dc.prefix == 'Bon de commande'
        );
  
        if (bonDeCommande) {
          this.bonDeCommandeClassId = bonDeCommande.id;
  
          // 💡 Appeler ici, une fois l'ID correct obtenu
          this.documentService.getDernierCodeDocumentParClasse(this.bonDeCommandeClassId).subscribe({
            next: (dernierCode: string) => {
              const numero = parseInt(dernierCode || '0', 10) + 1;
              this.num_seq = numero.toString().padStart(5, '0');
              this.formattedOrderNumber = this.num_seq;
            },
            error: () => {
              this.num_seq = '00001';
              this.formattedOrderNumber = '00001';
            }
          });
  
        } else {
          console.error("Classe de document 'Bon de commande' non trouvée.");
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des classes de document :", err);
      }
    });
  }
  
  getDocumentClassesAndLoadNextCode() {
    this.documentService.getDocumentClasses().subscribe({
      next: (classes: DocumentClass[]) => {
        this.documentClasses = classes;
  
        const bonDeCommande = classes.find(dc =>
          dc.prefix?.toLowerCase() === 'bon de commande'
        );
  
        if (bonDeCommande) {
          this.bonDeCommandeClassId = bonDeCommande.id;
  
          // Charger le dernier code une fois la classe trouvée
          this.documentService.getDernierCodeDocumentParClasse(sessionStorage.getItem('codeClasseDoc')).subscribe({
            next: (dernierCode: string) => {
              // Extraire le numéro sans préfixe (ex: "DOC-0002" → "0002")
             
              this.formattedOrderNumber = dernierCode;
            },
            error: () => {
              this.num_seq = '00001';
              this.formattedOrderNumber = '00001';
            }
          });
  
        } else {
          console.error("Classe de document 'Bon de commande' non trouvée.");
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des classes de document :", err);
      }
    });
  }
  
 getDocumentClassIdByLabel(label: string): number | null {
  const lowerLabel = label.toLowerCase().trim();
  const docClass = this.documentClasses.find(dc =>
    (dc.libelle && dc.libelle.toLowerCase().trim() === lowerLabel) ||
    (dc.prefix && dc.prefix.toLowerCase().trim() === lowerLabel)
  );
  return docClass ? docClass.id : null;
}

  loadClients() {
    this.devisService.getClients().subscribe(data => {
      this.clients = data;
    });
  }
  loadProduits() {
    this.devisService.getProduits().subscribe(data => {
      this.produitsDansCommande = data;

    });
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

  onClientSelect(clientId: number) {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      this.selectedClient = client;
      this.devis.client_id = client.id;
    }
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
      produitExistant.prixTotal = produitExistant.quantite * produit.prix * (1 + produit.tva / 100);
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
        quantite, 
        prixTotal: quantite * produit.prix*(1 + produit.tva / 100),
        puht:produit.prix,
        tva:produit.tva
      });
    }
  
    this.calculerTotal();
  }
  
  getStockRestant(item: DevisProduit): number {
    if (item && item.produit && item.produit.quantitystock != undefined) {
      return item.produit.quantitystock - item.quantite;
    }
    return 0;  
  }
  
  
  supprimerProduit(produit: DevisProduit) {
    this.devisProduits = this.devisProduits.filter(p => p !== produit);
    this.calculerTotal();
  }

  calculerTotal() {
    this.totalHT = this.devisProduits.reduce((sum, p) => sum + p.prixTotal, 0);
    this.totalTTC = this.totalHT * (1 + this.tva / 100);
  }

  
  formatOrderNumber() {
    const currentNumber = parseInt(this.numero|| '1', 10);
    this.formattedOrderNumber = currentNumber.toString().padStart(5, '0');
  }
  
  
  modifierProduit(produit: DevisProduit) {
    const quantite = prompt('Modifier la quantité', produit.quantite.toString());
    if (quantite) {
      const newQuantite = parseInt(quantite, 10);
  
    if (newQuantite > produit.produit.quantitystock) {
        this.messageService.add({
          severity: 'error',
          summary: 'Quantité non valide',
          detail: `La quantité demandée dépasse le stock disponible (${produit.produit.quantitystock}).`
        });
        return;
      }
  
      if (newQuantite > produit.produit.seuil) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Attention!',
          detail: `Vous avez dépassé le seuil recommandé pour ce produit (${produit.produit.seuil}).`
        });
      }
  
      produit.quantite = newQuantite;
      produit.prixTotal = produit.quantite * produit.produit.prix * (1 + produit.tva / 100);
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
    // Vérifier l'existence de la classe de document
    const libelle = 'Bon de commande';
    const classId = this.getDocumentClassIdByLabel(libelle);
    
    if (!classId) {
      console.error(`Classe de document '${libelle}' non trouvée.`);
      return;
    }
  
    const document: Document = {
      id: 0,  // Nouveau document, ID à 0
      document_class_id: classId,  // ID de la classe de document
      codeclassedocument: sessionStorage.getItem('codeClasseDoc'),  // Code de la classe du document, ici 'Bon de commande'
      libelle: 'Bon de commande',  // Libelle du document
      code: '',  
      numero:'',
      dateDocument: this.devis.dateLivraison?.toISOString() || new Date().toISOString(),  // Date du document (livraison ou actuelle)
      etat: this.devis.etat,  // État du document (par exemple: En cours, Validé)
      preparateur_id: this.devis.preparateur_id,  // Préparateur du document
      client_id: this.selectedClient?.id,  // ID du client sélectionné
      devise: this.devis.devise,  // Devise
      tauxEchange: this.devis.tauxEchange,  // Taux de change
      dateLivraison: this.devis.dateLivraison?.toISOString() || new Date().toISOString(),  // Date de livraison
      produitsCommandes: this.devisProduits.map(p => ({
        produit_id: p.produit.id,
        quantite: p.quantite,
        prixTotal: p.prixTotal,
        puht:p.puht,
        tva:p.tva,
      })),  // Détails des produits dans la commande
      documentClass: { id: classId } as DocumentClass,  // Classe du document
    };
  
    // Appel au service pour enregistrer le document
    this.documentService.saveDocument(document).subscribe({
      next: (savedDoc) => {

        this.savedDoc = savedDoc
        console.log('savedDoc', savedDoc)
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `Bon de commande enregistré sous le code ${savedDoc.code}`
        });
        this.formattedOrderNumber = savedDoc.code;  // Mettre à jour le numéro de commande
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
          setTimeout(() => {

    console.log(this.savedDoc['data'].id)
    this.router.navigate(['vente/bon-livraison/', this.savedDoc['data'].id]);
          }, 2000); // délai en millisecondes
 
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
      produit.quantite = produit.produit.quantitystock; // Réinitialisation à la quantité max disponible
    }
  
    if (produit.quantite > produit.produit.seuil) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Seuil dépassé',
        detail: `La quantité dépasse le seuil recommandé de ${produit.produit.seuil}`
      });
    }
  
produit.prixTotal = produit.quantite * produit.produit.prix * (1 + produit.tva / 100);
    this.calculerTotal();
  }
  

  imprimerDevis(id: number) {
    if (id === 0) {
      this.saveBonDeCommandeAsDocument();
      return;
    }
    console.log("ID à imprimer :", id);
    window.open(`http://localhost:8000/api/documents/${id}/print`, '_blank');
  }
}