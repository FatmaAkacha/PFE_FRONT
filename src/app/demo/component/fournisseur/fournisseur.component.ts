import { Component, OnInit,ChangeDetectorRef  } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Fournisseur } from '../../domain/fournisseur';
import { DataService } from '../../service/data.service';
import { BreadcrumbService } from 'src/app/breadcrumb.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  previewUrl: SafeUrl | null = null;

  constructor(
    private fournisseurService: DataService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService, 
    private breadcrumbService: BreadcrumbService,    
    private cdRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer
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
      { field: 'email', header: 'Email' },
      { field: 'logo', header: 'Logo' }
    ];
  }

  openNew() {
    this.fournisseur = {} as Fournisseur;
    this.submitted = false;
    this.fournisseurDialog = true;
  }
  getImageSrc(fournisseur: Fournisseur): SafeUrl | string | null {
    if (!fournisseur || !fournisseur.logo) return null;
  
    // Cas où logo est déjà une URL complète
    if (typeof fournisseur.logo === 'string') {
      if (fournisseur.logo.startsWith('http')) {
        return fournisseur.logo;
      }
      return this.sanitizer.bypassSecurityTrustUrl(`http://localhost:8000/storage/${fournisseur.logo}`);
    }
  
    // Cas où logo est un File (upload local non encore enregistré)
    if (fournisseur.logo instanceof File) {
      return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(fournisseur.logo));
    }
  
    return null;
  }

  onFileUploadSelect(event: any): void {
  const file = event.files[0];
  if (file) {
    this.fournisseur.logo = file;
    const objectUrl = URL.createObjectURL(file);
    this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
    this.cdRef.detectChanges();
  }
}

    
    onImageSelect(event: any): void {
      const file = event.target.files[0];
      if (file) {
        this.fournisseur.logo = file;
        const objectUrl = URL.createObjectURL(file);
        this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.cdRef.detectChanges();
      }
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
      const formData = new FormData();
      formData.append('name', this.fournisseur.name);
      formData.append('email', this.fournisseur.email ?? '');
      formData.append('phone', this.fournisseur.phone ?? '');
      formData.append('address', this.fournisseur.address ?? '');
      formData.append('matricule_fiscal', this.fournisseur.matricule_fiscal ?? '');
  
      if (this.fournisseur.logo instanceof File) {
        formData.append('logo', this.fournisseur.logo, this.fournisseur.logo.name);
      }
  
      if (this.fournisseur.id) {
        this.fournisseurService.updateFournisseurForm(this.fournisseur.id, formData).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Fournisseur mis à jour', life: 3000 });
          this.refreshFournisseurList();
        });
      } else {
        this.fournisseurService.insertFournisseurForm(formData).subscribe((newFournisseur: Fournisseur) => {
          this.fournisseurs.push(newFournisseur);
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Fournisseur ajouté', life: 3000 });
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
    this.messageService.add({severity: 'info', summary: 'Succéss', detail: 'Fichier téléchargé'});
  }
}