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
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  pieChartData: any;
  pieChartOptions: any;
  categoryChartData: any;
  categoryChartOptions: any;
  activeNews = 1;
  selectedYear: number = 2025;

  constructor(
    private categorieService: CategorieService,
    private dataService: DataService,
    private documentService: DocumentService,
    private ligneDocumentService: LigneDocumentService,
    private magasinierService: MagasinierService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupCharts();
  }

  loadData(): void {
    this.dataService.getClients().subscribe(clients => {
      this.clients = clients;
    });

    this.dataService.getProduits().subscribe(products => {
      this.products = products.map(product => ({
        ...product,
        image: this.getImageUrl(product.image_data),
        inventoryStatus: product.quantitystock && product.seuil
          ? product.quantitystock > product.seuil ? 'INSTOCK' : 'LOWSTOCK'
          : 'OUTOFSTOCK'
      }));
      this.updateCategoryChartData();
    });

    this.documentService.getDocuments().subscribe(documents => {
      this.documents = documents.map(doc => ({
        ...doc,
        etat: this.normalizeEtat(doc.etat)
      }));
      this.updateChartData();
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

  getImageUrl(imageData: string): SafeUrl {
    if (imageData) {
      const fullUrl = `http://localhost:8000/storage/${imageData}`;
      return this.sanitizer.bypassSecurityTrustUrl(fullUrl);
    }
    return 'https://via.placeholder.com/150';
  }

  setupCharts(): void {
    // Pie chart setup
    this.pieChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        }
      }
    };

    // Bar chart setup for products by category
    this.categoryChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        },
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    };

    this.updateChartData();
    this.updateCategoryChartData();
  }

  updateChartData(): void {
    const statuses = ['EnCours', 'Validé', 'Annulé', 'UNKNOWN'];
    const statusCounts = statuses.map(status => 
      this.documents.filter(doc => doc.etat === status && new Date(doc.dateDocument).getFullYear() === this.selectedYear).length
    );

    this.pieChartData = {
      labels: statuses,
      datasets: [{
        data: statusCounts,
        backgroundColor: ['#C8E6C9', '#FEEDAF', '#FFCDD2', '#9E9E9E'],
        hoverOffset: 20
      }]
    };
  }

  updateCategoryChartData(): void {
    const categoryCounts = this.products.reduce((acc, product) => {
      const categoryName = product.categorie?.nom || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);

    this.categoryChartData = {
      labels: labels.length ? labels : ['No Categories'],
      datasets: [{
        label: 'Products by Category',
        data: data.length ? data : [0],
        backgroundColor: ['#65afc4', '#f2c260', '#8fb56f', '#a4719b', '#FFCDD2'],
        borderColor: ['#65afc4', '#f2c260', '#8fb56f', '#a4719b', '#FFCDD2'],
        borderWidth: 1
      }]
    };
  }
}