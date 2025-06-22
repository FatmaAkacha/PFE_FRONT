import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Role } from '../../domain/role';
import { UserService } from '../../service/user.service'; // ✅ Import corrigé
import { BreadcrumbService } from 'src/app/breadcrumb.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class RoleComponent implements OnInit {
  roleDialog: boolean = false;
  deleteRoleDialog: boolean = false;
  deleteRolesDialog: boolean = false;

  roles: Role[] = [];
  role: Role = {} as Role;
  selectedRoles: Role[] = [];

  submitted: boolean = false;
  cols: any[];
  rowsPerPageOptions = [5, 10, 20];

  constructor(
    private userService: UserService, // ✅ Utilise maintenant le UserService
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.setItems([{ label: 'Roles', routerLink: ['/role'] }]);
  }

  ngOnInit(): void {
    this.refreshRoles();

    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'description', header: 'Description' }
    ];
  }

  openNew() {
    this.role = {} as Role;
    this.submitted = false;
    this.roleDialog = true;
  }

  editRole(role: Role) {
    this.role = { ...role };
    this.roleDialog = true;
  }

  deleteRole(role: Role) {
    this.deleteRoleDialog = true;
    this.role = { ...role };
  }

  deleteSelectedRoles() {
    this.deleteRolesDialog = true;
  }

  confirmDeleteSelected() {
    this.deleteRolesDialog = false;
    const idsToDelete = this.selectedRoles.map(r => r.id);
    idsToDelete.forEach(id => {
      if (id) {
        this.userService.deleteRole(id).subscribe(() => {
          this.roles = this.roles.filter(role => role.id !== id);
        });
      }
    });
    this.messageService.add({ severity: 'success', summary: 'Réussie', detail: 'Rôles supprimés', life: 3000 });
    this.selectedRoles = [];
  }

  confirmDelete() {
    if (this.role.id) {
      this.userService.deleteRole(this.role.id).subscribe(() => {
        this.roles = this.roles.filter(r => r.id !== this.role.id);
        this.messageService.add({ severity: 'success', summary: 'Réussie', detail: 'Rôles supprimés', life: 3000 });
        this.role = {} as Role;
      });
    }
    this.deleteRoleDialog = false;
  }

  hideDialog() {
    this.roleDialog = false;
    this.submitted = false;
  }

  saveRole() {
    this.submitted = true;

    if (this.role.name && this.role.name.trim()) {
      if (this.role.id) {
        this.userService.updateRole(this.role.id, this.role).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Réussie', detail: 'Rôle mis à jour', life: 3000 });
          this.refreshRoles();
        });
      } else {
        this.userService.insertRole(this.role).subscribe((newRole: Role) => {
          this.roles.push(newRole);
          this.messageService.add({ severity: 'success', summary: 'Réussie', detail: 'Rôle créé', life: 3000 });
          this.refreshRoles();
        });
      }
      this.roleDialog = false;
      this.role = {} as Role;
    }
  }

  refreshRoles() {
    this.userService.getRoles().subscribe((data: Role[]) => {
      this.roles = data;
    });
  }
}