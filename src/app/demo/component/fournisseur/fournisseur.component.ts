import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Fournisseur } from '../../domain/fournisseur';
import { DataService } from '../../service/data.service';
import { BreadcrumbService } from 'src/app/breadcrumb.service';

@Component({
  selector: 'app-fournisseur',
  templateUrl: './fournisseur.component.html',
  styleUrls: ['./fournisseur.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class FournisseurComponent implements OnInit {
  fournisseurDialog: boolean;
  deleteFournisseurDialog: boolean = false;
  deleteFournisseursDialog: boolean = false;
  fournisseurs: Fournisseur[];
  fournisseur: Fournisseur;
  selectedFournisseurs: Fournisseur[];
  submitted: boolean;
  cols: any[];
  rowsPerPageOptions = [5, 10, 20];
  uploadedFiles: any[] = [];

  constructor(
    private fournisseurService: DataService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService, 
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.setItems([
      { label: 'Fournisseur', routerLink: ['/fournisseur'] }
    ]);
  }

  ngOnInit() {
    this.fournisseurService.getFournisseurs().subscribe(fournisseurs => {
      this.fournisseurs = fournisseurs as Fournisseur[];
    });

    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'address', header: 'Address' },  
      { field: 'phone', header: 'Phone' },      
      { field: 'matricule_fiscal', header: 'Fiscal ID' }, 
      { field: 'email', header: 'Email' }
    ];
  }

  openNew() {
    this.fournisseur = {} as Fournisseur;
    this.submitted = false;
    this.fournisseurDialog = true;
  }

  deleteSelectedFournisseurs() {
    this.deleteFournisseursDialog = true;
  }

  editFournisseur(fournisseur: Fournisseur) {
    this.fournisseur = { ...fournisseur };
    this.fournisseurDialog = true;
  }

  deleteFournisseur(fournisseur: Fournisseur) {
    this.deleteFournisseurDialog = true;
    this.fournisseur = { ...fournisseur };
  }

  confirmDeleteSelected() {
    this.deleteFournisseursDialog = false;
    this.selectedFournisseurs.forEach(selectedFournisseur => {
      this.fournisseurService.deleteFournisseur(selectedFournisseur.id).subscribe(() => {
        this.fournisseurs = this.fournisseurs.filter(val => val.id !== selectedFournisseur.id);
      });
    });
    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Fournisseurs Deleted', life: 3000 });
    this.selectedFournisseurs = null;
  }

  confirmDelete() {
    this.deleteFournisseurDialog = false;
    this.fournisseurService.deleteFournisseur(this.fournisseur.id).subscribe(() => {
      this.fournisseurs = this.fournisseurs.filter(val => val.id !== this.fournisseur.id);
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Fournisseur Deleted', life: 3000 });
      this.fournisseur = {} as Fournisseur;
    });
  }

  hideDialog() {
    this.fournisseurDialog = false;
    this.submitted = false;
  }

  saveFournisseur() {
    this.submitted = true;

    if (this.fournisseur.name.trim()) {
      if (this.fournisseur.id) {
        this.fournisseurService.updateFournisseur(this.fournisseur.id, this.fournisseur).subscribe(() => {
          this.fournisseurs[this.findIndexById(this.fournisseur.id)] = this.fournisseur;
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Fournisseur Updated', life: 3000 });
          this.refreshFournisseurList();
        });
      } else {
        this.fournisseurService.insertFournisseur(this.fournisseur).subscribe((newFournisseur: Fournisseur) => {
          this.fournisseurs.push(newFournisseur);
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Fournisseur Created', life: 3000 });
          this.refreshFournisseurList();
        });
      }

      this.fournisseurDialog = false;
      this.fournisseur = {} as Fournisseur;
    }
  }

  refreshFournisseurList() {
    this.fournisseurService.getFournisseurs().subscribe(fournisseurs => this.fournisseurs = fournisseurs as Fournisseur[]);
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.fournisseurs.length; i++) {
      if (this.fournisseurs[i].id === id) {
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
    this.messageService.add({severity: 'info', summary: 'Success', detail: 'File Uploaded'});
  }
}