import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  devis: Devis;  // Utiliser l'objet Devis ici aussi
  devisProduits: DevisProduit[] = [];
  tva = 20;
  totalHT = 0;
  totalTTC = 0;
  selectedClient: Client = {} as Client;
  formattedOrderNumber: string = '';
  currentDate: Date = new Date(); 
  currentOrderNumber: number = 1;
  
  constructor(
    private fb: FormBuilder,
    private devisService: DevisService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute // Pour récupérer les paramètres de la route
  ) {}

  ngOnInit(): void {
    // Récupérer les informations du devis (facture)
    this.route.paramMap.subscribe(params => {
      this.formattedOrderNumber = params.get('orderNumber') || ''; // Récupérer le numéro de la commande depuis l'URL
      this.loadFactureData(this.formattedOrderNumber);
    });
  }

  loadFactureData(orderNumber: string) {
    // Ici, vous pouvez utiliser `orderNumber` pour récupérer les données de la facture via le service
    this.devisService.getDevisById(Number(orderNumber)).subscribe(data => {
      this.devis = data;
      this.devisProduits = data.produits;
      this.calculerTotal();
    });
  }

  generatePDF() {
    const doc = new jsPDF();
  
    // Titre
    doc.setFontSize(16);
    doc.text(`Facture Client N°${this.formattedOrderNumber}`, 14, 20);
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
      head: [['Code', 'Désignation', 'Stock', 'Quantité', 'PUHT/U', 'TVA %', 'TTC'] ],
      body: produitData,
      didDrawPage: (data) => {
        const finalY = data.cursor.y;  // Position finale du tableau
        doc.text(`Total HT: ${this.totalHT.toFixed(2)} ${this.devis.devise}`, 14, finalY + 10);
        doc.text(`Total TTC: ${this.totalTTC.toFixed(2)} ${this.devis.devise}`, 14, finalY + 20);
      }
    });
  
    // Générer le PDF et l'afficher dans le navigateur
    doc.save(`Facture_Client_${this.formattedOrderNumber}.pdf`);
  }

  calculerTotal() {
    this.totalHT = this.devisProduits.reduce((sum, p) => sum + p.prixTotal, 0);
    this.totalTTC = this.totalHT * (1 + this.tva / 100);
  }
}
