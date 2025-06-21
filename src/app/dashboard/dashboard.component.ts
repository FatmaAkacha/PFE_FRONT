import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [MessageService, ConfirmationService]
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
  productDialog: boolean = false;
  deleteProductDialog: boolean = false;
  deleteProductsDialog: boolean = false;
  product: Produit = {} as Produit;
  selectedProducts: Produit[] = [];
  submitted: boolean = false;
  categories: any[] = [];
  fournisseursList: any[] = [];
  previewUrl: SafeUrl | null = null;
  activeStep = 0;
  steps = [
    { label: 'Information' },
    { label: 'Price' },
    { label: 'Stock' },
    { label: 'Image' }
  ];
  documentDialog: boolean = false;
  deleteDocumentDialog: boolean = false;
  document: Document = {} as Document;

  constructor(
    private categorieService: CategorieService,
    private dataService: DataService,
    private documentService: DocumentService,
    private ligneDocumentService: LigneDocumentService,
    private magasinierService: MagasinierService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupCharts();
    this.getCategories();
    this.getFournisseurs();
  }

  loadData(): void {
    this.dataService.getClients().subscribe(clients => {
      this.clients = clients;
      this.documentService.getDocuments().subscribe(documents => {
        this.documents = documents.map(doc => ({
          ...doc,
          etat: this.normalizeEtat(doc.etat),
          client: this.clients.find(client => client.id === doc.client_id) || { nom: 'N/A' }
        }));
        this.updateChartData();
      });
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

    this.magasinierService.getMagasiniers().subscribe(magasiniers => {
      this.magasiniers = magasiniers;
    });

    this.dataService.getFournisseurs().subscribe(fournisseurs => {
      this.fournisseurs = fournisseurs;
      this.fournisseursList = fournisseurs;
    });
  }

  normalizeEtat(etat: string | undefined): string {
    if (!etat) return 'Inconnue';
    switch (etat.toLowerCase()) {
      case 'en cours':
        return 'EnCours';
      case 'validé':
        return 'Validé';
      case 'annulé':
        return 'Annulé';
      default:
        return 'Inconnue';
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
    const statuses = ['EnCours', 'Validé', 'Annulé', 'Inconnue'];
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

  getCategories(): void {
    this.categorieService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  getFournisseurs(): void {
    this.dataService.getFournisseurs().subscribe(data => {
      this.fournisseursList = data;
    });
  }

  openNewProduct(): void {
    this.product = {} as Produit;
    this.previewUrl = null;
    this.submitted = false;
    this.activeStep = 0;
    this.productDialog = true;
  }

  editProduct(product: Produit): void {
    this.product = { ...product };
    this.previewUrl = null;
    this.submitted = false;
    this.activeStep = 0;
    this.productDialog = true;
  }

  deleteProduct(produit: Produit): void {
    this.product = { ...produit };
    this.deleteProductDialog = true;
  }

  deleteSelectedProducts(): void {
    if (this.selectedProducts?.length) {
      this.deleteProductsDialog = true;
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Selection',
        detail: 'Please select products to delete.',
        life: 3000
      });
    }
  }

  confirmDelete(): void {
    this.deleteProductDialog = false;
    this.dataService.deleteProduit(this.product.id).subscribe({
      next: () => {
        this.products = this.products.filter(val => val.id !== this.product.id);
        this.updateCategoryChartData();
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product deleted',
          life: 3000
        });
        this.product = {} as Produit;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message || 'Failed to delete product',
          life: 3000
        });
      }
    });
  }

  confirmDeleteSelected(): void {
    this.deleteProductsDialog = false;
    if (this.selectedProducts?.length) {
      this.selectedProducts.forEach(product => {
        this.dataService.deleteProduit(product.id).subscribe({
          next: () => {
            this.products = this.products.filter(val => val.id !== product.id);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Failed to delete product ${product.nom}`,
              life: 3000
            });
          }
        });
      });
      this.updateCategoryChartData();
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Selected products deleted',
        life: 3000
      });
      this.selectedProducts = [];
    }
  }

  saveProduct(): void {
    this.submitted = true;
    if (!this.product.nom || !this.product.categorie) {
      return;
    }

    const formData = new FormData();
    formData.append('nom', this.product.nom);
    formData.append('description', this.product.description ?? '');
    formData.append('prix', String(this.product.prix ?? 0));
    formData.append('quantitystock', String(this.product.quantitystock ?? 0));
    formData.append('seuil', String(this.product.seuil ?? 0));
    formData.append('categorie_id', String(this.product.categorie?.id ?? ''));
    formData.append('prix_achat', String(this.product.prix_achat ?? 0));
    formData.append('prix_vente_ht', String(this.product.prix_vente_ht ?? 0));
    formData.append('prix_vente_ttc', String(this.product.prix_vente_ttc ?? 0));
    formData.append('remise_maximale', String(this.product.remise_maximale ?? 0));
    formData.append('quantite', String(this.product.quantite ?? 0));
    formData.append('tva', String(this.product.tva ?? 0));
    formData.append('inventoryStatus', this.product.inventoryStatus ?? '');
    formData.append('fournisseur_id', String(this.product.fournisseur ?? ''));

    if (this.product.image_data instanceof File) {
      formData.append('image_data', this.product.image_data, this.product.image_data.name);
    }

    if (this.product.id) {
      this.dataService.updateProduitForm(this.product.id, formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Product updated',
            life: 3000
          });
          this.loadData();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update product',
            life: 3000
          });
        }
      });
    } else {
      this.dataService.insertProduitForm(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Product created',
            life: 3000
          });
          this.loadData();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create product',
            life: 3000
          });
        }
      });
    }

    this.productDialog = false;
    this.product = {} as Produit;
    this.previewUrl = null;
  }

  onFileUploadSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.product.image_data = file;
      const objectUrl = URL.createObjectURL(file);
      this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      this.cdRef.detectChanges();
    }
  }

  nextStep(): void {
    if (this.activeStep < this.steps.length - 1) this.activeStep++;
  }

  previousStep(): void {
    if (this.activeStep > 0) this.activeStep--;
  }

  onStepChange(event: number): void {
    this.activeStep = event;
  }

  editDocument(doc: Document): void {
    this.document = { ...doc, dateDocument: doc.dateDocument ? new Date(doc.dateDocument).toISOString().split('T')[0] : '' };
    this.documentDialog = true;
  }

  deleteDocument(doc: Document): void {
    this.document = { ...doc };
    this.deleteDocumentDialog = true;
  }

  confirmDeleteDocument(): void {
    this.deleteDocumentDialog = false;
    this.documentService.deleteDocument(this.document.id).subscribe({
      next: () => {
        this.documents = this.documents.filter(val => val.id !== this.document.id);
        this.updateChartData();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Document supprimé',
          life: 3000
        });
        this.document = {} as Document;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.error.message || 'Échec de la suppression du document',
          life: 3000
        });
      }
    });
  }

  saveDocument(): void {
    this.submitted = true;
    if (!this.document.libelle) {
      return;
    }

    const documentData = { ...this.document };
    if (typeof documentData.dateDocument === 'string') {
      documentData.dateDocument = new Date(documentData.dateDocument).toISOString();
    }

    if (this.document.id) {
      this.documentService.updateDocument(this.document.id, documentData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Document mis à jour',
            life: 3000
          });
          this.loadData();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la mise à jour du document',
            life: 3000
          });
        }
      });
    } else {
      this.documentService.saveDocument(documentData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Document créé',
            life: 3000
          });
          this.loadData();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la création du document',
            life: 3000
          });
        }
      });
    }

    this.documentDialog = false;
    this.document = {} as Document;
    this.submitted = false;
  }
}