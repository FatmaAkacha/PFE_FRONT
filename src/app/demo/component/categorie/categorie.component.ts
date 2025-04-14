import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategorieService } from 'src/app/demo/service/categorie.service';
import { Categorie } from '../../domain/Categorie';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss'],
  providers: [MessageService]
})
export class CategorieComponent implements OnInit {
  categories: Categorie[] = [];
  categorieDialog: boolean = false;
  deleteCategorieDialog: boolean = false;
  selectedCategories: Categorie[] = [];
  submitted: boolean = false;

  categorie: Categorie = { id: null, nom: '',description: '' };

  constructor(
    private categorieService: CategorieService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categorieService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  openNew() {
    this.categorie = { id: null, nom: '' ,description: '' };
    this.submitted = false;
    this.categorieDialog = true;
  }

  editCategorie(categorie: Categorie) {
    this.categorie = { ...categorie };
    this.categorieDialog = true;
  }

  deleteCategorieDialogOpen(categorie: Categorie) {
    this.categorie = categorie;
    this.deleteCategorieDialog = true;
  }

  saveCategorie() {
    this.submitted = true;
  
    if (!this.categorie.nom) return;
  
    if (this.categorie.id) {
      this.categorieService.updateCategorie(this.categorie.id.toString(), this.categorie).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Catégorie mise à jour' });
          this.loadCategories();
          this.categorieDialog = false;
        },
        error: err => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la mise à jour' });
        }
      });
    } else {
      this.categorieService.insertCategorie(this.categorie).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Catégorie ajoutée' });
          this.loadCategories();
          this.categorieDialog = false;
        },
        error: err => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'ajout' });
        }
      });
    }
  }
  
  

  confirmDelete() {
    this.categorieService.deleteCategorie(this.categorie.id!).subscribe({
      next: () => {
        this.messageService.add({ severity: 'warn', summary: 'Supprimée', detail: `Catégorie "${this.categorie.nom}" supprimée` });
        this.loadCategories();
        this.deleteCategorieDialog = false;
      },
      error: err => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer cette catégorie' });
      }
    });
  }
  

  hideDialog() {
    this.categorieDialog = false;
    this.submitted = false;
  }
}
