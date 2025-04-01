import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DevisService } from 'src/app/demo/service/devis.service';
import { Client } from 'src/app/demo/domain/client';
import { Produit } from 'src/app/demo/domain/produit';
import { Devis, DevisProduit } from 'src/app/demo/domain/devis';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-devis',
  templateUrl: './devis.component.html',
  styleUrls: ['./devis.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class DevisComponent implements OnInit {
  devisDialog: boolean = false;
  devisList: Devis[] = [];
  devis: Devis;
  devisForm: FormGroup;
  clients: Client[] = [];
  produits: Produit[] = [];
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
  totalStock: number = 0;
  etatOptions: string[] = ['En cours', 'Validé', 'Annulé']; 
  preparateurs = [{ nom: 'John Doe' }, { nom: 'Jane Doe' }];
  deviseOptions = [
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Dollar ($)', value: 'USD' },
    { label: 'Dinar Tunisien (DT)', value: 'TND' }
  ];

  constructor(
    private fb: FormBuilder,
    private devisService: DevisService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
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
      devise: 'EUR',          
      tauxEchange: 1,         
      dateLivraison: new Date()
    };
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadProduits();
    this.loadDevis();
    this.formatOrderNumber();
    this.incrementOrderNumber();
  }
  

  generatePDF() {
    const doc = new jsPDF();
  
    // Titre
    doc.setFontSize(16);
    doc.text(`Bon de Commande Client N°${this.formattedOrderNumber}`, 14, 20);
    doc.text(`Date: ${this.currentDate.toLocaleDateString()}`, 14, 30);
  
    // Détails du client
    doc.setFontSize(12);
    doc.text(`Client: ${this.selectedClient.nom}`, 14, 40);
    doc.text(`Code client: ${this.selectedClient.code}`, 14, 50);
    doc.text(`Raison sociale: ${this.selectedClient.raison_sociale}`, 14, 60);
    doc.text(`Téléphone: ${this.selectedClient.numero_telephone}`, 14, 70);
    doc.text(`Adresse: ${this.selectedClient.adresse}`, 14, 80);
  
    // Ajouter un tableau pour les produits
    const produitData = this.devisProduits.map(p => [
      p.produit.id,
      p.produit.nom,
      p.produit.quantitystock,  // Assurez-vous que 'stock' est bien défini dans votre modèle Produit
      p.quantite,
      p.produit.prix,
      this.tva,
      p.prixTotal
    ]);
  
    // Utilisation d'autoTable
    autoTable(doc, {
      startY: 90,  // Position initiale du tableau
      head: [['Code', 'Désignation', 'Stock', 'Quantité', 'PUHT/U', 'TVA %', 'TTC']],
      body: produitData,
      didDrawPage: (data) => {
        // Calculer la position après le tableau
        const finalY = data.cursor.y;  // Position finale du tableau
        doc.text(`Total HT: ${this.totalHT.toFixed(2)} ${this.devis.devise}`, 14, finalY + 10);
        doc.text(`Total TTC: ${this.totalTTC.toFixed(2)} ${this.devis.devise}`, 14, finalY + 20);
      }
    });
  
    // Générer le PDF et l'afficher dans le navigateur
    doc.save(`Bon_de_Commande_Client_${this.formattedOrderNumber}.pdf`);
  }
  
  loadClients() {
    this.devisService.getClients().subscribe(data => {
      this.clients = data;
    });
  }

  loadProduits() {
    this.devisService.getProduits().subscribe(data => this.produits = data);
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
    this.devisService.getProduitsByClient(client.id).subscribe(data => {
      this.produitsClient = data;
    this.totalStock = this.produitsClient.reduce((sum, produit) => sum + produit.quantitystock, 0);

    });
  }

  ajouterProduit(produit: Produit) {
    const produitExistant = this.devisProduits.find(p => p.produit.id === produit.id);
    if (produitExistant) {
      produitExistant.quantite++;
      produitExistant.prixTotal = produitExistant.quantite * produit.prix;
    } else {
      this.devisProduits.push({
        produit,
        quantite: 1,
        prixTotal: produit.prix
      });
    }
    this.calculerTotal();
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
  }

  formatOrderNumber() {
    this.formattedOrderNumber = ('000000' + this.currentOrderNumber).slice(-6);
  }
  
  
  modifierProduit(produit: DevisProduit) {
    const quantite = prompt('Modifier la quantité', produit.quantite.toString());
    if (quantite) {
      produit.quantite = parseInt(quantite, 10);
      produit.prixTotal = produit.quantite * produit.produit.prix;
      this.calculerTotal();
      this.messageService.add({ severity: 'info', summary: 'Modification', detail: 'Produit modifié' });
    }
  }
  
  
}
