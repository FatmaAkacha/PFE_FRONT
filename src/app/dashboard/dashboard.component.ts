import { Component, OnInit } from '@angular/core';
import { CategorieService } from '../demo/service/categorie.service';
import { DataService } from '../demo/service/data.service';
import { DocumentService } from '../demo/service/document.service';
import { LigneDocumentService } from '../demo/service/ligne-document.service';
import { MagasinierService } from '../demo/service/magasinier.service';
import { Client } from '../demo/domain/client';
import { Produit } from '../demo/domain/produit';
import { Document } from '../demo/domain/document';
import { Magasinier } from '../demo/domain/magasinier';
import { Fournisseur } from '../demo/domain/fournisseur'; 

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  clients: Client[] = [];
  products: Produit[] = [];
  documents: Document[] = [];
  magasiniers: Magasinier[] = [];
  fournisseurs: Fournisseur[] = [];
  lineChartData: any;
  lineChartOptions: any;
  activeNews = 1; 
  selectedYear: any;

  constructor(
    private categorieService: CategorieService,
    private dataService: DataService,
    private documentService: DocumentService,
    private ligneDocumentService: LigneDocumentService,
    private magasinierService: MagasinierService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupChart();
  }

  loadData(): void {
    this.dataService.getClients().subscribe(clients => {
      this.clients = clients;
    });

    this.dataService.getProduits().subscribe(products => {
      this.products = products.map(product => ({
        ...product,
        inventoryStatus: product.quantitystock && product.seuil
          ? product.quantitystock > product.seuil ? 'INSTOCK' : 'LOWSTOCK'
          : 'OUTOFSTOCK'
      }));
    });

    this.documentService.getDocuments().subscribe(documents => {
      this.documents = documents.map(doc => ({
        ...doc,
        etat: this.normalizeEtat(doc.etat)
      }));
    });

    this.magasinierService.getMagasiniers().subscribe(magasiniers => {
      this.magasiniers = magasiniers;
    });

    this.dataService.getFournisseurs().subscribe(fournisseurs => {
      this.fournisseurs = fournisseurs;
    });
  }

  normalizeEtat(etat: string | undefined): string {
    if (!etat) return 'UNKNOWN';
    switch (etat.toLowerCase()) {
      case 'en cours':
        return 'EnCours';
      case 'validé':
        return 'Validé';
      case 'annulé':
        return 'Annulé';
      default:
        return 'UNKNOWN';
    }
  }

  setupChart(): void {
    this.lineChartData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [
        {
          label: 'Product Sales',
          data: [65, 59, 80, 81, 56, 55],
          fill: false,
          borderColor: '#4bc0c0'
        },
        {
          label: 'Documents Created',
          data: [28, 48, 40, 19, 86, 27],
          fill: false,
          borderColor: '#565656'
        }
      ]
    };

    this.lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };
  }
}