import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DevisService } from 'src/app/demo/service/devis.service';
import { Client } from 'src/app/demo/domain/client';
import { Produit } from 'src/app/demo/domain/produit';
import { Devis, DevisProduit } from 'src/app/demo/domain/devis';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-facture',
  templateUrl: './facture.component.html',
  styleUrls: ['./facture.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class FactureComponent implements OnInit {
  factureDialog: boolean = false;
  devis: Devis | null = null;
  clients: Client[] = [];
  produits: Produit[] = [];
  devisProduits: DevisProduit[] = [];
  tva: number = 20;
  totalHT: number = 0;
  totalTTC: number = 0;
  selectedClient: Client | null = null;
  formattedOrderNumber: string = '';
  currentDate: Date = new Date();

  constructor(
    private devisService: DevisService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.formattedOrderNumber = this.route.snapshot.paramMap.get('orderNumber') || '';
  
    const storedClient = localStorage.getItem('factureClient');
    const storedProduits = localStorage.getItem('factureProduits');
    const savedOrderNumber = localStorage.getItem('factureOrderNumber');
  
    if (savedOrderNumber) {
      this.formattedOrderNumber = savedOrderNumber;
    }
  
    if (storedClient) this.selectedClient = JSON.parse(storedClient);
    if (storedProduits) this.devisProduits = JSON.parse(storedProduits);
  
    this.calculerTotal();
  }
  

  generatePDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Facture Client N°${this.formattedOrderNumber}`, 14, 20);
    doc.text(`Date: ${this.currentDate.toLocaleDateString()}`, 14, 30);

    if (this.selectedClient) {
      doc.setFontSize(12);
      doc.text(`Client: ${this.selectedClient.nom}`, 14, 40);
      doc.text(`Code client: ${this.selectedClient.code}`, 14, 50);
      doc.text(`Raison sociale: ${this.selectedClient.raison_sociale}`, 14, 60);
      doc.text(`Téléphone: ${this.selectedClient.numero_telephone}`, 14, 70);
      doc.text(`Adresse: ${this.selectedClient.adresse}`, 14, 80);
    }

    const produitData = this.devisProduits.map(p => [
      p.produit.id,
      p.produit.nom,
      p.produit.quantitystock,
      p.quantite,
      p.produit.prix.toFixed(2),
      this.tva + '%',
      p.prixTotal.toFixed(2)
    ]);

    autoTable(doc, {
      startY: 90,
      head: [['Code', 'Désignation', 'Stock', 'Quantité', 'PUHT/U', 'TVA %', 'TTC']],
      body: produitData,
      didDrawPage: (data) => {
        const finalY = data.cursor.y;
        doc.text(`Total HT: ${this.totalHT.toFixed(2)} €`, 14, finalY + 10);
        doc.text(`Total TTC: ${this.totalTTC.toFixed(2)} €`, 14, finalY + 20);
      }
    });

    doc.save(`Facture_Client_${this.formattedOrderNumber}.pdf`);
  }

  calculerTotal() {
    this.totalHT = this.devisProduits.reduce((sum, p) => sum + p.prixTotal, 0);
    this.totalTTC = this.totalHT * (1 + this.tva / 100);
  }
  finaliserFacture() {
    let orderNumber = parseInt(localStorage.getItem('currentOrderNumber') || '1', 10);
    orderNumber++;
    localStorage.setItem('currentOrderNumber', orderNumber.toString());
  
    localStorage.removeItem('factureOrderNumber');
  
    this.router.navigate(['/vente/devise']);
  }
  
}