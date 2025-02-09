import { Component, OnInit } from '@angular/core';
import { EmailService } from '../../service/email.service';
import { DataService } from '../../service/data.service';
import { User } from '../../domain/user';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api'; 
@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  providers: [MessageService] 
})
export class EmailComponent implements OnInit {

  subject: string = '';
  message: string = '';
  users: User[] = [];
  selectedUser: User | null = null;

  constructor(
    private emailService: EmailService,
    private userService: DataService,
    private messageService: MessageService  
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      this.users = await firstValueFrom(this.userService.getUsers());
      console.log('Users loaded:', this.users);
      if (this.users.length > 0) {
        this.selectedUser = this.users[0];
      }
    } catch (error) {
      console.error('Error loading users', error);
    }
  }

  sendEmail() {
    if (!this.subject || !this.message) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Subject and Message cannot be empty', life: 3000 });
      return;
    }

    if (this.selectedUser) {
      this.emailService.sendEmail(this.selectedUser.email, this.subject, this.message).subscribe(
        response => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Email sent successfully', life: 3000 });
        },
        error => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send email', life: 3000 });
        }
      );
    }
  }

  onUserChange(event: any) {
    console.log('User changed:', event.target.value);
  }
}
