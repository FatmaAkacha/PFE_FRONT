import { Component, OnInit } from '@angular/core';
import { Magasinier } from '../../domain/magasinier';
import { MagasinierService } from '../../service/magasinier.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-magasinier',
  templateUrl: './magasinier.component.html',
  styleUrls: ['./magasinier.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class MagasinierComponent implements OnInit {
  magasinierDialog = false;
  deleteMagasinierDialog = false;
  deleteMagasiniersDialog = false;
  magasiniers: Magasinier[] = [];
  magasinier: Magasinier = {} as Magasinier;
  selectedMagasiniers: Magasinier[] = [];
  submitted = false;
  cols: any[];
  rowsPerPageOptions = [5, 10, 20];

  constructor(
    private magasinierService: MagasinierService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadMagasiniers();

    this.cols = [
      { field: 'nom', header: 'Nom' },
      { field: 'adresse', header: 'Adresse' },
      { field: 'numero_telephone', header: 'Téléphone' },
      { field: 'email', header: 'Email' },
    ];
  }

  loadMagasiniers() {
    this.magasinierService.getMagasiniers().subscribe((data) => {
      this.magasiniers = data;
    });
  }

  openNew() {
    this.magasinier = {} as Magasinier;
    this.submitted = false;
    this.magasinierDialog = true;
  }

  editMagasinier(m: Magasinier) {
    this.magasinier = { ...m };
    this.magasinierDialog = true;
  }

  deleteMagasinier(m: Magasinier) {
    this.magasinier = m;
    this.deleteMagasinierDialog = true;
  }

  confirmDelete() {
    this.magasinierService.deleteMagasinier(this.magasinier.id!).subscribe(() => {
      this.magasiniers = this.magasiniers.filter(m => m.id !== this.magasinier.id);
      this.messageService.add({ severity: 'success', summary: 'Supprimé', detail: 'Magasinier supprimé', life: 3000 });
      this.deleteMagasinierDialog = false;
    });
  }

  deleteSelectedMagasiniers() {
    this.deleteMagasiniersDialog = true;
  }

  confirmDeleteSelected() {
    this.selectedMagasiniers.forEach((m) => {
      this.magasinierService.deleteMagasinier(m.id!).subscribe();
    });
    this.magasiniers = this.magasiniers.filter(val => !this.selectedMagasiniers.includes(val));
    this.messageService.add({ severity: 'success', summary: 'Supprimés', detail: 'Magasiniers supprimés', life: 3000 });
    this.selectedMagasiniers = [];
    this.deleteMagasiniersDialog = false;
  }

  saveMagasinier() {
    this.submitted = true;
    if (!this.magasinier.nom || !this.magasinier.email) return;

    if (this.magasinier.id) {
      this.magasinierService.updateMagasinier(this.magasinier.id, this.magasinier).subscribe(() => {
        this.loadMagasiniers();
        this.messageService.add({ severity: 'success', summary: 'Mis à jour', detail: 'Magasinier mis à jour', life: 3000 });
      });
    } else {
      this.magasinierService.insertMagasinier(this.magasinier).subscribe((m) => {
        this.magasiniers.push(m);
        this.messageService.add({ severity: 'success', summary: 'Ajouté', detail: 'Magasinier ajouté', life: 3000 });
      });
    }

    this.magasinierDialog = false;
    this.magasinier = {} as Magasinier;
  }

  hideDialog() {
    this.magasinierDialog = false;
    this.submitted = false;
  }
}
