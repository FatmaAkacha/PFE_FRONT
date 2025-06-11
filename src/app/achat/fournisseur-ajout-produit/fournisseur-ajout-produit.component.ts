import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DataService } from 'src/app/demo/service/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Categorie } from 'src/app/demo/domain/Categorie';
import { Produit } from 'src/app/demo/domain/produit';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CategorieService } from 'src/app/demo/service/categorie.service';
import { BreadcrumbService } from 'src/app/breadcrumb.service';

@Component({
  selector: 'app-fournisseur-ajout-produit',
  templateUrl: './fournisseur-ajout-produit.component.html',
  styleUrls: ['./fournisseur-ajout-produit.component.scss'],
  providers: [MessageService],
})
export class FournisseurAjoutProduitComponent implements OnInit {
  produitDialog: boolean = false;
    deleteProduitDialog: boolean = false;
    deleteProduitsDialog: boolean = false;
    produits: Produit[] = [];
    produit: Produit = {} as Produit;
    selectedProduits: Produit[] = [];
    submitted: boolean = false;
    cols: any[] = [];
    rowsPerPageOptions = [5, 10, 20];
    categories: any[] = [];
    fournisseurs: any[] = [];
    previewUrl: SafeUrl | null = null;
    activeStep = 0;
  
    constructor(
      private produitService: DataService,
      private categorieService: CategorieService,
      private messageService: MessageService,
      private confirmationService: ConfirmationService,
      private breadcrumbService: BreadcrumbService,
      private cdRef: ChangeDetectorRef,
      private sanitizer: DomSanitizer,
      private router: Router
    ) {
      this.breadcrumbService.setItems([{ label: 'Produit', routerLink: ['/produit'] }]);
    }
  
    ngOnInit() {
      this.refreshProduitList();
      this.getCategories();
      this.getFournisseurs();
  
      this.cols = [
        { field: 'nom', header: 'Nom' },
        { field: 'categorie.nom', header: 'Catégorie' },
        { field: 'description', header: 'Description' },
        { field: 'prix', header: 'Prix' },
        { field: 'prix_achat', header: 'Prix Achat' },
        { field: 'prix_vente_ht', header: 'Prix Vente HT' },
        { field: 'prix_vente_ttc', header: 'Prix Vente TTC' },
        { field: 'remise_maximale', header: 'Remise (%)' },
        { field: 'quantitystock', header: 'Stock' },
        { field: 'quantite', header: 'Quantité' },
        { field: 'seuil', header: 'Seuil' },
        { field: 'tva', header: 'tva' },
        { field: 'inventoryStatus', header: 'Statut Stock' },
        { field: 'fournisseur', header: 'Fournisseur ' },
        { field: 'image_data', header: 'Image' },
      ];    
    }
    steps = [
      { label: 'Informations' },
      { label: 'Prix' },
      { label: 'Stock' },
      { label: 'Image' }
    ];
    
    nextStep() {
      if (this.activeStep < this.steps.length - 1) this.activeStep++;
    }
    
    previousStep() {
      if (this.activeStep > 0) this.activeStep--;
    }
    
    onStepChange(event: number) {
      this.activeStep = event;
    }
    getCategories() {
      this.categorieService.getCategories().subscribe((data) => {
        this.categories = data;
      });
    }
    getFournisseurs() {
      this.produitService.getFournisseurs().subscribe((data) => {
        this.fournisseurs = data;
      });
    }
    
  
    openNew() {
      this.produit = {} as Produit;
      this.previewUrl = null;  // Réinitialiser la preview
      this.submitted = false;
      this.produitDialog = true;
    }
    getRowClass(produit: Produit): string {
      switch (produit.inventoryStatus) {
        case 'INSTOCK':
          return 'row-instock';
        case 'LOWSTOCK':
          return 'row-lowstock';
        case 'OUTOFSTOCK':
          return 'row-outofstock';
        default:
          return '';
      }
    }
    onFileUploadSelect(event: any): void {
      const file = event.files[0];
      if (file) {
        this.produit.image_data = file;
        const objectUrl = URL.createObjectURL(file);
        this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.cdRef.detectChanges();
      }
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
    updateProduit(){
      this.submitted = true;
      const formData = new FormData();
      formData.append('nom', this.produit.nom);
      formData.append('description', this.produit.description ?? '');
      formData.append('prix', String(this.produit.prix ?? 0));
      formData.append('quantitystock', String(this.produit.quantitystock ?? 0));
      formData.append('seuil', String(this.produit.seuil ?? 0));
      formData.append('categorie_id', String(this.produit.categorie?.id ?? ''));
      formData.append('prix_achat', String(this.produit.prix_achat ?? 0));
      formData.append('prix_vente_ht', String(this.produit.prix_vente_ht ?? 0));
      formData.append('prix_vente_ttc', String(this.produit.prix_vente_ttc ?? 0));
      formData.append('remise_maximale', String(this.produit.remise_maximale ?? 0));
      formData.append('quantite', String(this.produit.quantite ?? 0));
      formData.append('tva', String(this.produit.tva ?? 0));
      formData.append('inventoryStatus', this.produit.inventoryStatus ?? '');
      formData.append('fournisseur_id', String(this.produit.fournisseur?.id ?? this.produit.fournisseur ?? ''));
  
  
  
  
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
            this.router.navigate(['/achat/Updateproduit', this.produit.id]);
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
          next: (newProduit: Produit) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Produit Created',
              life: 3000,
            });
            this.refreshProduitList();
            this.router.navigate(['/achat/Updateproduit', newProduit.id]);
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
  
    saveProduit() {
      this.submitted = true;
      const formData = new FormData();
      formData.append('nom', this.produit.nom);
      formData.append('description', this.produit.description ?? '');
      formData.append('prix', String(this.produit.prix ?? 0));
      formData.append('quantitystock', String(this.produit.quantitystock ?? 0));
      formData.append('seuil', String(this.produit.seuil ?? 0));
      formData.append('categorie_id', String(this.produit.categorie?.id ?? ''));
      formData.append('prix_achat', String(this.produit.prix_achat ?? 0));
      formData.append('prix_vente_ht', String(this.produit.prix_vente_ht ?? 0));
      formData.append('prix_vente_ttc', String(this.produit.prix_vente_ttc ?? 0));
      formData.append('remise_maximale', String(this.produit.remise_maximale ?? 0));
      formData.append('quantite', String(this.produit.quantite ?? 0));
      formData.append('tva', String(this.produit.tva ?? 0));
      formData.append('inventoryStatus', this.produit.inventoryStatus ?? '');
      formData.append('fournisseur_id', String(this.produit.fournisseur?.id ?? this.produit.fournisseur ?? ''));
  
  
  
  
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
            this.router.navigate(['/achat/bon-commande-fournisseur', this.produit.id]);
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
          next: (newProduit: Produit) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Produit Created',
              life: 3000,
            });
            this.refreshProduitList();
            this.router.navigate(['/achat/bon-commande-fournisseur', newProduit.id]);

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
  