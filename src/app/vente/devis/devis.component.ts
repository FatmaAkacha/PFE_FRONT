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
    { label: 'Dinar Tunisien (DT)', value: 'TND' },
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'Dollar ($)', value: 'USD' }
  ];

  constructor(
    private fb: FormBuilder,
    private devisService: DevisService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
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
    this.loadProduits(); // Charge tous les produits disponibles
    this.loadDevis();
  
    this.produitsClient = this.produits; // Initialisez avec tous les produits
  
    const savedOrderNumber = localStorage.getItem('currentOrderNumber');
    if (savedOrderNumber) {
      this.currentOrderNumber = parseInt(savedOrderNumber, 10);
    } else {
      this.currentOrderNumber = 1;
    }
  
    this.formatOrderNumber();
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
  
    // Charger tous les produits, indépendamment du client sélectionné
    this.produitsClient = this.produits; // Afficher tous les produits
    
    // Calculer la somme du stock total si nécessaire
    this.totalStock = this.produitsClient.reduce((sum, produit) => sum + produit.quantitystock, 0);
  }
  

  ajouterProduit(produit: Produit) {
    // Vérification si la quantité sélectionnée ne dépasse pas le stock ou le seuil
    const produitExistant = this.devisProduits.find(p => p.produit.id === produit.id);
  
    if (produitExistant) {
      const newQuantite = produitExistant.quantite + 1;
  
      if (newQuantite > produit.quantitystock) {
        this.messageService.add({
          severity: 'error',
          summary: 'Quantité non valide',
          detail: `La quantité demandée dépasse le stock disponible (${produit.quantitystock}).`
        });
        return;
      }
  
      if (newQuantite > produit.seuil) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Attention!',
          detail: `Vous dépassez le seuil recommandé (${produit.seuil}).`
        });
      }
  
      produitExistant.quantite++;
      produitExistant.prixTotal = produitExistant.quantite * produit.prix;
    } else {
      if (produit.quantitystock <= 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Stock insuffisant',
          detail: 'Il n\'y a pas assez de stock disponible pour ce produit.'
        });
        return;
      }
  
      // Limiter la quantité d'ajout selon le stock
      if (produit.quantitystock < 1) {
        this.messageService.add({
          severity: 'error',
          summary: 'Stock insuffisant',
          detail: `Le stock de ${produit.nom} est insuffisant.`
        });
        return;
      }
  
      // Vérification du seuil
      if (1 > produit.seuil) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Attention!',
          detail: `Vous avez dépassé le seuil recommandé pour ce produit (${produit.seuil}).`
        });
      }
  
      // Ajouter le produit avec la quantité 1 et calculer le prix total
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
  
  validerDevis() {
    localStorage.setItem('factureClient', JSON.stringify(this.selectedClient));
    localStorage.setItem('factureProduits', JSON.stringify(this.devisProduits));
    localStorage.setItem('factureOrderNumber', this.formattedOrderNumber);
  
    this.router.navigate(['/vente/bon-livraison', this.formattedOrderNumber]);
  
    this.incrementOrderNumber();
  }
  
  
  confirmerEtValiderDevis() {
    this.confirmationService.confirm({
      message: 'Voulez-vous transformer en bon de livraison ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.validerDevis();  // Fonction existante qui gère la redirection
      },
      reject: () => {
        this.messageService.add({ 
          severity: 'info', 
          summary: 'Annulé', 
          detail: 'Le devis n’a pas été transformé.' 
        });
      }
    });
  }
  
  
}
