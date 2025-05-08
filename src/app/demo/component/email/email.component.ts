import { Component, OnInit } from '@angular/core';
import { EmailService } from '../../service/email.service';
import { Client } from '../../domain/client';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api'; 
import { DataService } from '../../service/data.service';
@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  providers: [MessageService] 
})
export class EmailComponent implements OnInit {

  subject: string = '';
  message: string = '';
  clients: Client[] = [];
  selectedClient: Client | null = null;

  constructor(
    private emailService: EmailService,
    private clientService: DataService,
    private messageService: MessageService  
  ) {}

  ngOnInit() {
    this.loadClients();
  }
  async loadClients() {
    try {
      this.clients = await firstValueFrom(this.clientService.getClients());
      if (this.clients.length > 0) {
        this.selectedClient = this.clients[0];
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients', error);
    }
  }

  sendEmail() {
    if (!this.subject || !this.message) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Objet et message requis', life: 3000 });
      return;
    }
  
    if (this.selectedClient) {
      this.emailService.sendEmail(this.selectedClient.email, this.subject, this.message).subscribe(
        response => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Email envoyé', life: 3000 });
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de l’envoi', life: 3000 });
        }
      );
    }
  }
  

  onClientChange(event: any) {
    console.log('Client changé :', this.selectedClient);
  }
  
}
