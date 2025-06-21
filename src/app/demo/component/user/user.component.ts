import { Component, OnInit } from '@angular/core';
import { User } from '../../domain/user';
import { Role } from '../../domain/role';
import { UserService } from '../../service/user.service';
import { MessageService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/breadcrumb.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  providers: [MessageService],
})
export class UserComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  userDialog: boolean = false;
  deleteUserDialog: boolean = false;
  deleteUsersDialog: boolean = false;

  user: User = this.initUser();
  selectedUsers: User[] = [];
  submitted: boolean = false;

  rowsPerPageOptions: number[] = [5, 10, 20];

  constructor(
    private breadcrumbService: BreadcrumbService,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }
  loadRoles() {
    this.userService.getRoles().subscribe((data) => {
      this.roles = data;
    });
  }
  getRoleName(roleId: number): string {
    return this.roles.find(r => r.id === roleId)?.name || 'Inconnue';
  }
  

  initUser(): User {
    return {
      id: '',
      username: '',
      email: '',
      password: '',
      role_id: 0,
    };
  }

  loadUsers() {
    this.userService.getUsers().subscribe((data) => {
      this.users = data;
    });
  }

  openNew() {
    this.user = this.initUser();
    this.submitted = false;
    this.userDialog = true;
  }

  editUser(user: User) {
    this.user = { ...user };
    this.userDialog = true;
  }

  deleteUser(user: User) {
    this.user = { ...user };
    this.deleteUserDialog = true;
  }

  confirmDelete() {
    this.userService.deleteUser(this.user.id).subscribe(() => {
      this.users = this.users.filter(u => u.id !== this.user.id);
      this.deleteUserDialog = false;
      this.user = this.initUser();
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
    });
  }

  deleteSelectedUsers() {
    this.deleteUsersDialog = true;
  }

  confirmDeleteSelected() {
    const ids = this.selectedUsers.map(u => u.id);
    ids.forEach(id => {
      this.userService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(user => !ids.includes(user.id));
      });
    });

    this.deleteUsersDialog = false;
    this.selectedUsers = [];
    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Users Deleted', life: 3000 });
  }

  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
  }

  saveUser() {
    this.submitted = true;

    if (!this.user.username || !this.user.email || !this.user.password) return;

    if (!this.user.id) {
      this.userService.insertUser(this.user).subscribe((newUser) => {
        this.users.push(newUser);
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Created', life: 3000 });
      });
    } else {
      this.userService.updateUser(this.user.id.toString(), this.user).subscribe((updatedUser) => {
        this.users[this.users.findIndex(u => u.id === updatedUser.id)] = updatedUser;
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 });
      });
    }

    this.userDialog = false;
    this.user = this.initUser();
  }
}
