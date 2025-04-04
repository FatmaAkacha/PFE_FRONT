import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Devis, DevisProduit } from 'src/app/demo/domain/devis';
import { Client } from 'src/app/demo/domain/client';
import { Produit } from 'src/app/demo/domain/produit';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DevisService } from 'src/app/demo/service/devis.service';

@Component({
  selector: 'app-bon-livraison',
  templateUrl: './bon-livraison.component.html',
  styleUrls: ['./bon-livraison.component.scss'],
  providers: [MessageService],
})
export class BonLivraisonComponent implements OnInit {
  bonLivraisonProduits: DevisProduit[] = [];
  selectedClient: Client = {} as Client;
  formattedOrderNumber: string = '';
  currentDate: Date = new Date();
  totalHT = 0;
  totalTTC = 0;
  tva = 20;

  constructor(
    private messageService: MessageService,
    private router: Router,
    private devisService: DevisService
  ) {}

  ngOnInit(): void {
    this.loadBonLivraison();
  }

  loadBonLivraison() {
    const storedClient = localStorage.getItem('factureClient');
    const storedProduits = localStorage.getItem('factureProduits');
    const storedOrderNumber = localStorage.getItem('factureOrderNumber');

    if (storedClient && storedProduits) {
      this.selectedClient = JSON.parse(storedClient);
      this.bonLivraisonProduits = JSON.parse(storedProduits);
      this.formattedOrderNumber = storedOrderNumber || '000001';
      this.calculerTotal();
    }
  }

  calculerTotal() {
    this.totalHT = this.bonLivraisonProduits.reduce((sum, p) => sum + p.prixTotal, 0);
    this.totalTTC = this.totalHT * (1 + this.tva / 100);
  }

  generatePDF() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Bon de Livraison N°${this.formattedOrderNumber}`, 14, 20);
    doc.text(`Date: ${this.currentDate.toLocaleDateString()}`, 14, 30);
    
    doc.setFontSize(12);
    doc.text(`Client: ${this.selectedClient.nom}`, 14, 40);
    doc.text(`Code client: ${this.selectedClient.code}`, 14, 50);
    doc.text(`Adresse: ${this.selectedClient.adresse}`, 14, 60);

    const produitData = this.bonLivraisonProduits.map(p => [
      p.produit.id,
      p.produit.nom,
      p.quantite,
      p.produit.prix,
      this.tva,
      p.prixTotal
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Code', 'Désignation', 'Quantité', 'PUHT/U', 'TVA %', 'TTC']],
      body: produitData,
    });

    doc.save(`Bon_de_Livraison_${this.formattedOrderNumber}.pdf`);
  }
  transformerEnFacture() {
    localStorage.setItem('factureClient', JSON.stringify(this.selectedClient));
    localStorage.setItem('factureProduits', JSON.stringify(this.bonLivraisonProduits));
    localStorage.setItem('factureOrderNumber', this.formattedOrderNumber);
  
    // On navigue avec l’orderNumber dans l’URL
    this.router.navigate([`/vente/facture/${this.formattedOrderNumber}`]);
  }
  
  
}
