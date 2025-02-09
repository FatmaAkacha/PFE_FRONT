import { Component, OnInit } from '@angular/core';
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
  clientDialog: boolean;
  deleteClientDialog: boolean = false;
  deleteClientsDialog: boolean = false;
  clients: Client[];
  client: Client;
  selectedClients: Client[];
  submitted: boolean;
  cols: any[];
  rowsPerPageOptions = [5, 10, 20];

  constructor(
    private clientService: DataService, 
    private messageService: MessageService,
    private confirmationService: ConfirmationService, 
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.setItems([
      { label: 'Client', routerLink: ['/client'] }
    ]);
  }

  ngOnInit() {
    this.clientService.getClients().subscribe(clients => {
      this.clients = clients as Client[];
    });

    this.cols = [
      { field: 'nom', header: 'Name' },
      { field: 'adresse', header: 'Adresse' },
      { field: 'numero_telephone', header: 'Numéro Téléphone' },
      { field: 'logo', header: 'Logo' },
      { field: 'email', header: 'Email' }
    ];
  }

  openNew() {
    this.client = {} as Client;
    this.submitted = false;
    this.clientDialog = true;
  }

  deleteSelectedClients() {
    this.deleteClientsDialog = true;
  }

  editClient(client: Client) {
    this.client = { ...client };
    this.clientDialog = true;
  }

  deleteClient(client: Client) {
    this.deleteClientDialog = true;
    this.client = { ...client };
  }


  confirmDeleteSelected() {
    this.deleteClientsDialog = false;
    this.selectedClients.forEach(selectedClient => {
      this.clientService.deleteClient(selectedClient.id).subscribe(() => {
        this.clients = this.clients.filter(val => val.id !== selectedClient.id);
      });
    });
    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Clients Deleted', life: 3000 });
    this.selectedClients = null;
}

  confirmDelete() {
    this.deleteClientDialog = false;
    this.clientService.deleteClient(this.client.id).subscribe(() => {
      this.clients = this.clients.filter(val => val.id !== this.client.id);
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Client Deleted', life: 3000 });
      this.client = {} as Client;
    });
  }

  hideDialog() {
    this.clientDialog = false;
    this.submitted = false;
  }

  saveClient() {
    this.submitted = true;

    if (this.client.nom.trim()) {
      if (this.client.id) {
        this.clientService.updateClient(this.client.id, this.client).subscribe(() => {
          this.clients[this.findIndexById(this.client.id)] = this.client;
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Client Updated', life: 3000 });
          this.refreshClientList();
        });
      } else {
        this.clientService.insertClient(this.client).subscribe((newClient: Client) => {
          this.clients.push(newClient);
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Client Created', life: 3000 });
          this.refreshClientList();
        });
      }

      this.clientDialog = false;
      this.client = {} as Client;
    }
  }

  refreshClientList() {
    this.clientService.getClients().subscribe(clients => this.clients = clients as Client[]);
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i].id === id) {
        index = i;
        break;
      }
    }
    return index;
  }
}
