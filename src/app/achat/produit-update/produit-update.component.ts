import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/demo/service/data.service';
import { Produit } from 'src/app/demo/domain/produit';
import { MessageService } from 'primeng/api';
import { CategorieService } from 'src/app/demo/service/categorie.service';

@Component({
  selector: 'app-produit-update',
  templateUrl: './produit-update.component.html',
  styleUrls: ['./produit-update.component.scss'],
  providers: [MessageService],
})
export class ProduitUpdateComponent implements OnInit {
  produit: Produit = {} as Produit;
  submitted = false;

  // Pour la navigation des étapes
  activeStep: number = 0;

  // Pour les dropdowns catégories et fournisseurs (à adapter selon vos données)
  categories: any[] = [];
  fournisseurs: any[] = [];

  // Pour la prévisualisation d'image
  previewUrl: string | ArrayBuffer | null = null;
  selectedImageFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private produitService: DataService,
    private messageService: MessageService,
    private categorieService : CategorieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Charger le produit à modifier
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduit(id);
    }

    this.getCategories();
    this.loadFournisseurs();
  }

  loadProduit(id: string) {
    this.produitService.getProduitById(id).subscribe({
      next: (produit) => {
        this.produit = produit;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Produit non trouvé',
          life: 3000,
        });
      }
    });
  }

    getCategories() {
      this.categorieService.getCategories().subscribe((data) => {
        this.categories = data;
      });
    }

  loadFournisseurs() {
    // Exemple de récupération, adapter selon votre DataService
    this.produitService.getFournisseurs().subscribe({
      next: (data) => {
        this.fournisseurs = data;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les fournisseurs',
          life: 3000,
        });
      }
    });
  }

  // Gestion de la sélection d'image et prévisualisation
  onImageSelect(event: any) {
    const file = event.target.files && event.target.files[0];
    if (file) {
      this.selectedImageFile = file;

      const reader = new FileReader();
      reader.onload = e => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.previewUrl = null;
      this.selectedImageFile = null;
    }
  }

  // Navigation entre étapes
  nextStep() {
    if (this.activeStep < 3) {
      this.activeStep++;
    }
  }

  previousStep() {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  saveProduit() {
    this.submitted = true;
    if (!this.produit.id) return;

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

    // Ajouter l'image si sélectionnée
    if (this.selectedImageFile) {
      formData.append('image', this.selectedImageFile);
    }

    this.produitService.updateProduitForm(this.produit.id, formData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Produit mis à jour',
          life: 3000,
        });
        this.router.navigate(['/produit']); // retour liste produits
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'La mise à jour a échoué',
          life: 3000,
        });
      }
    });
  }
}