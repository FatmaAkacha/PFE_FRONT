import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Produit } from '../../domain/produit';
import { DataService } from '../../service/data.service';
import { BreadcrumbService } from 'src/app/breadcrumb.service';

@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class ProduitComponent implements OnInit {
  produitDialog: boolean = false;
  deleteProduitDialog: boolean = false;
  deleteProduitsDialog: boolean = false;
  produits: Produit[] = [];
  produit: Produit = {} as Produit;
  selectedProduits: Produit[] = [];
  submitted: boolean = false;
  cols: any[] = [];
  rowsPerPageOptions = [5, 10, 20];
  // Pour la prévisualisation lors de la création/modification
  previewUrl: SafeUrl | null = null;

  constructor(
    private produitService: DataService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private cdRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    this.breadcrumbService.setItems([{ label: 'Produit', routerLink: ['/produit'] }]);
  }

  ngOnInit() {
    this.refreshProduitList();
    this.cols = [
      { field: 'nom', header: 'Name' },
      { field: 'description', header: 'Description' },
      { field: 'prix', header: 'Price' },
      { field: 'quantitystock', header: 'Stock Quantity' },
      { field: 'seuil', header: 'Threshold' },
      { field: 'image_data', header: 'Image' },
    ];
  }

  openNew() {
    this.produit = {} as Produit;
    this.previewUrl = null;  // Réinitialiser la preview
    this.submitted = false;
    this.produitDialog = true;
  }

  /**
   * Retourne l'URL d'affichage de l'image.
   * - Si l'utilisateur a sélectionné un fichier non encore enregistré, on utilise la preview (SafeUrl).
   * - Sinon, si produit.image_data est une chaîne (attendue en base64), on construit une data URL.
   * - Sinon, en fallback, si le produit possède un id, on utilise l'endpoint.
   */
  private safeDecode(str: string): string {
    try {
      return decodeURIComponent(str);
    } catch (e) {
      console.error('Erreur lors du décodage de l\'URI, utilisation de la chaîne originale:', e);
      // Retourne la chaîne originale si le décodage échoue
      return str;
    }
  }
  
  getImageSrc(produit: Produit): SafeUrl | string {
    if (typeof produit.image_data === 'string' && produit.image_data.trim() !== '') {
      const src = `http://localhost:8000/storage/${produit.image_data}`;
      return this.sanitizer.bypassSecurityTrustUrl(src);
    }
    return '';
  }
  
  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.produit.image_data = file;
      const objectUrl = URL.createObjectURL(file);
      // Créer une URL sécurisée pour la prévisualisation
      this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      this.cdRef.detectChanges();
    }
  }

  // Méthodes standard (delete, edit, save, refresh, etc.)
  deleteSelectedProduits() {
    this.deleteProduitsDialog = true;
  }

  editProduit(produit: Produit) {
    this.produit = { ...produit };
    this.previewUrl = null;
    this.produitDialog = true;
  }

  deleteProduit(produit: Produit) {
    this.deleteProduitDialog = true;
    this.produit = { ...produit };
  }

  confirmDeleteSelected() {
    this.deleteProduitsDialog = false;
    if (this.selectedProduits?.length) {
      this.selectedProduits.forEach((selectedProduit) => {
        this.produitService.deleteProduit(selectedProduit.id).subscribe({
          next: () => {
            this.produits = this.produits.filter((val) => val.id !== selectedProduit.id);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: `Échec de la suppression du produit ${selectedProduit.nom}`,
              life: 3000,
            });
          },
        });
      });
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Produits supprimés',
        life: 3000,
      });
      this.selectedProduits = [];
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucune sélection',
        detail: 'Veuillez sélectionner des produits à supprimer.',
        life: 3000,
      });
    }
  }

  confirmDelete() {
    this.deleteProduitDialog = false;
    this.produitService.deleteProduit(this.produit.id).subscribe({
      next: () => {
        this.produits = this.produits.filter(val => val.id !== this.produit.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Produit supprimé',
          life: 3000,
        });
        this.produit = {} as Produit;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'La suppression du produit a échoué.',
          life: 3000,
        });
      }
    });
  }

  hideDialog() {
    this.produitDialog = false;
    this.submitted = false;
  }

  saveProduit() {
    this.submitted = true;
    const formData = new FormData();
    formData.append('nom', this.produit.nom);
    formData.append('description', this.produit.description ?? '');
    formData.append('prix', String(this.produit.prix ?? 0));
    formData.append('quantitystock', String(this.produit.quantitystock ?? 0));
    formData.append('seuil', String(this.produit.seuil ?? 0));

    if (this.produit.image_data instanceof File) {
      formData.append('image_data', this.produit.image_data, this.produit.image_data.name);
    }

    if (this.produit.id) {
      this.produitService.updateProduitForm(this.produit.id, formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Produit Updated',
            life: 3000,
          });
          this.refreshProduitList();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Produit update failed',
            life: 3000,
          });
        }
      });
    } else {
      this.produitService.insertProduitForm(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Produit Created',
            life: 3000,
          });
          this.refreshProduitList();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Produit creation failed',
            life: 3000,
          });
        }
      });
    }

    this.produitDialog = false;
    this.produit = {} as Produit;
    this.previewUrl = null;
  }

  refreshProduitList() {
    this.produitService.getProduits().subscribe(produits => {
      this.produits = produits as Produit[];
    });
  }

  findIndexById(id: string): number {
    return this.produits.findIndex(p => p.id === id);
  }
}
