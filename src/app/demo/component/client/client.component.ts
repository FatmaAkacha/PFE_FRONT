import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Client } from '../../domain/client';
import { DataService } from '../../service/data.service';
import { BreadcrumbService } from 'src/app/breadcrumb.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class ClientComponent implements OnInit {
  clientDialog: boolean = false;
  deleteClientDialog: boolean = false;
  deleteClientsDialog: boolean = false;

  clients: Client[] = [];
  client: Client = {} as Client;
  selectedClients: Client[] = [];

  submitted: boolean = false;
  cols: any[] = [];
  rowsPerPageOptions = [5, 10, 20];

  uploadedFiles: any[] = [];
  previewUrl: SafeUrl | null = null;

  constructor(
    private clientService: DataService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService,
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef
  ) {
    this.breadcrumbService.setItems([
      { label: 'Client', routerLink: ['/client'] }
    ]);
  }

  ngOnInit(): void {
    this.loadClients();

    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'nom', header: 'Nom' },
      { field: 'raison_sociale', header: 'Raison Sociale' },
      { field: 'adresse', header: 'Adresse' },
      { field: 'numero_telephone', header: 'Numéro de Téléphone' },
      { field: 'contact', header: 'Contact' },
      { field: 'logo', header: 'Logo' },
      { field: 'email', header: 'Email' },
      { field: 'code', header: 'Code' }
    ];
  }

  loadClients(): void {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients;
    });
  }

  openNew(): void {
    this.client = {} as Client;
    this.submitted = false;
    this.clientDialog = true;
  }

  getLogoSrc(client: Client): SafeUrl | string {
    if (client.logo && typeof client.logo === 'string' && client.logo.trim() !== '') {
      const src = `http://localhost:8000/storage/${client.logo}`;
      return this.sanitizer.bypassSecurityTrustUrl(src);
    }
    return ''; // Si aucune image, ne pas afficher
  }


  onFileUploadSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.client.logo = file;
      const objectUrl = URL.createObjectURL(file);
      this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      this.cdRef.detectChanges();
    }
  }

  deleteSelectedClients(): void {
    this.deleteClientsDialog = true;
  }

  editClient(client: Client): void {
    this.client = { ...client };
    this.clientDialog = true;
  }

  deleteClient(client: Client): void {
    this.client = { ...client };
    this.deleteClientDialog = true;
  }

  confirmDeleteSelected(): void {
    this.deleteClientsDialog = false;
    const toDelete = [...this.selectedClients];
    toDelete.forEach(c => {
      this.clientService.deleteClient(c.id).subscribe(() => {
        this.clients = this.clients.filter(val => val.id !== c.id);
      });
    });
    this.messageService.add({ severity: 'success', summary: 'Réussie', detail: 'Clients supprimés', life: 3000 });
    this.selectedClients = [];
  }

  confirmDelete(): void {
    this.deleteClientDialog = false;
    this.clientService.deleteClient(this.client.id).subscribe(() => {
      this.clients = this.clients.filter(val => val.id !== this.client.id);
      this.messageService.add({ severity: 'success', summary: 'Réussie', detail: 'Client supprimé', life: 3000 });
      this.client = {} as Client;
    });
  }

  hideDialog(): void {
    this.clientDialog = false;
    this.submitted = false;
  }

  saveClient(): void {
    this.submitted = true;

    if (this.client.nom?.trim()) {
      const formData = new FormData();
      formData.append('nom', this.client.nom);
      formData.append('raison_sociale', this.client.raison_sociale ?? '');
      formData.append('adresse', this.client.adresse ?? '');
      formData.append('numero_telephone', this.client.numero_telephone ?? '');
      formData.append('contact', this.client.contact ?? '');
      formData.append('email', this.client.email ?? '');
      formData.append('code', this.client.code ?? '');

      if (this.client.logo instanceof File) {
        formData.append('logo', this.client.logo, this.client.logo.name);
      }

      if (this.client.id) {
        this.clientService.updateClientForm(this.client.id, formData).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Client modifié', life: 3000 });
          this.loadClients();
        });
      } else {
        this.clientService.insertClientForm(formData).subscribe((newClient: Client) => {
          this.clients.push(newClient);
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Client créé', life: 3000 });
          this.loadClients();
        });
      }

      this.clientDialog = false;
      this.client = {} as Client;
    }
  }

  onUpload(event: any): void {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }
    this.messageService.add({ severity: 'info', summary: 'Succès', detail: 'Fichier envoyé' });
  }

  findIndexById(id: string): number {
    return this.clients.findIndex(c => c.id === id);
  }
}
