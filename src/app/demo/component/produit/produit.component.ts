import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Produit } from '../../domain/produit';  // Import Produit interface
import { DataService } from '../../service/data.service';
import { BreadcrumbService } from 'src/app/breadcrumb.service';

@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class ProduitComponent implements OnInit {
  produitDialog: boolean;
  deleteProduitDialog: boolean = false;
  deleteProduitsDialog: boolean = false;
  produits: Produit[] = [];   
  produit: Produit;
  selectedProduits: Produit[];
  submitted: boolean;
  cols: any[];
  rowsPerPageOptions = [5, 10, 20];
  uploadedFiles: any[] = [];

  constructor(
    private produitService: DataService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService, 
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.setItems([
      { label: 'Produit', routerLink: ['/produit'] }
    ]);
  }

  ngOnInit() {
    this.produitService.getProduits().subscribe(produits => {
      this.produits = produits as Produit[];
    });

    this.cols = [
      { field: 'nom', header: 'Name' },
      { field: 'description', header: 'Description' },
      { field: 'prix', header: 'Price' },
      { field: 'quantitystock', header: 'Stock Quantity' },
      { field: 'seuil', header: 'Threshold' }
    ];
  }

  openNew() {
    this.produit = {} as Produit;
    this.submitted = false;
    this.produitDialog = true;
  }

  deleteSelectedProduits() {
    this.deleteProduitsDialog = true;
  }

  editProduit(produit: Produit) {
    this.produit = { ...produit };
    this.produitDialog = true;
  }

  deleteProduit(produit: Produit) {
    this.deleteProduitDialog = true;
    this.produit = { ...produit };
  }

  confirmDeleteSelected() {
    this.deleteProduitsDialog = false;
    this.selectedProduits.forEach(selectedProduit => {
      this.produitService.deleteProduit(selectedProduit.id).subscribe(() => {
        this.produits = this.produits.filter(val => val.id !== selectedProduit.id);
      });
    });
    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Produits Deleted', life: 3000 });
    this.selectedProduits = null;
  }

  confirmDelete() {
    this.deleteProduitDialog = false;
    this.produitService.deleteProduit(this.produit.id).subscribe(() => {
      this.produits = this.produits.filter(val => val.id !== this.produit.id);
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Produit Deleted', life: 3000 });
      this.produit = {} as Produit;
    });
  }

  hideDialog() {
    this.produitDialog = false;
    this.submitted = false;
  }

  saveProduit() {
    this.submitted = true;

    if (this.produit.nom.trim()) {
      if (this.produit.id) {
        this.produitService.updateProduit(this.produit.id, this.produit).subscribe(() => {
          this.produits[this.findIndexById(this.produit.id)] = this.produit;
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Produit Updated', life: 3000 });
          this.refreshProduitList();
        });
      } else {
        this.produitService.insertProduit(this.produit).subscribe((newProduit: Produit) => {
          this.produits.push(newProduit);
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Produit Created', life: 3000 });
          this.refreshProduitList();
        });
      }

      this.produitDialog = false;
      this.produit = {} as Produit;
    }
  }

  refreshProduitList() {
    this.produitService.getProduits().subscribe(produits => this.produits = produits as Produit[]);
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.produits.length; i++) {
      if (this.produits[i].id === id) {
        index = i;
        break;
      }
    }
    return index;
  }

  onUpload(event) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
  }
}
