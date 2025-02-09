import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../../service/data.service';
import { Mission } from '../../domain/mission';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BreadcrumbService } from 'src/app/breadcrumb.service';
import { firstValueFrom } from 'rxjs';
import { User } from '../../domain/user';
import { Client } from '../../domain/client';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  providers: [MessageService, ConfirmationService]
})
export class MissionComponent implements OnInit {
  missions: Mission[] = [];
  missionDialog: boolean = false;
  deleteMissionDialog: boolean = false;
  deleteMissionsDialog: boolean = false;
  mission: Mission;
  clients: Client[] = [];
  selectedMissions: Mission[] = [];
  submitted: boolean = false;
  cols: any[] = [];
  rowsPerPageOptions = [5, 10, 20];
  users: User[] = [];
  isExpanded: boolean = false;
  expandedRows = {};
  rowGroupMetadata: any;


  installationTypes = [
    { label: 'Pro Resto', value: 'pro_resto' },
    { label: 'Pro Pat', value: 'pro_pat' },
    { label: 'Pro Mag', value: 'pro_mag' }
  ];
  status = [
    { label: 'En Cour', value: 'encour' },
    { label: 'Affecter', value: 'affecter' },
    { label: 'Terminer', value: 'terminer' },
  ];
  selectedClients: any;
  clientMissions: any;

  @ViewChild('dt') table: Table;
  @ViewChild('filter') filter: ElementRef;
dt: any;

  constructor(
    private missionService: DataService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private breadcrumbService: BreadcrumbService
  ) {
    this.breadcrumbService.setItems([
      { label: 'Mission', routerLink: ['/mission'] }
    ]);
  }

  ngOnInit() {
    this.loadMissions();
    this.loadUsers();
    this.loadClients();

    this.cols = [
      { field: 'id_user', header: 'User ID' },
      { field: 'client_id', header: 'Client ID' },
      { field: 'date_debut', header: 'Start Date' },
      { field: 'date_fin', header: 'End Date' },
      { field: 'nombre_installation', header: 'Installation Count' },
      { field: 'moyen', header: 'Average' },
      { field: 'type_installation', header: 'Installation Type' },
      { field: 'status', header: 'Status' }
    ];

    this.mission = this.createEmptyMission();
  }
  getUserName(userId: string): string {
    const user = this.users?.find(user => user.id === userId);
    return user ? user.name : 'Unknown';
  }

  async loadMissions() {
    try {
      this.missions = await firstValueFrom(this.missionService.getData1());
      console.log('Missions loaded:', this.missions);
    } catch (error) {
      console.error('Error loading missions', error);
    }
  }

  async loadUsers() {
    try {
      this.users = await firstValueFrom(this.missionService.getUsers());
      console.log('Users loaded:', this.users);
    } catch (error) {
      console.error('Error loading users', error);
    }
  }

  async loadClients() {
    try {
      this.clients = await firstValueFrom(this.missionService.getClients());
      console.log('Clients loaded:', this.clients);
    } catch (error) {
      console.error('Error loading clients', error);
    }
  }

  expandAll() {
    if (!this.isExpanded) {
      this.missions.forEach(mission => this.expandedRows[mission.client_id] = true);
    } else {
      this.expandedRows = {};
    }
    this.isExpanded = !this.isExpanded;
  }

  onRowCollapse(event: any) {
    delete this.expandedRows[event.data.client_id];
  }

  openNew() {
    this.mission = this.createEmptyMission();
    this.submitted = false;
    this.missionDialog = true;
  }
  mailClient(clientId: string){
    
  }
  deleteSelectedMissions() {
    this.deleteMissionsDialog = true;
  }

  editMission(mission: Mission) {
    this.mission = { ...mission };
    this.missionDialog = true;
  }

  deleteMission(mission: Mission) {
    this.deleteMissionDialog = true;
    this.mission = { ...mission };
  }

  hideDialog() {
    this.missionDialog = false;
    this.submitted = false;
    this.mission = this.createEmptyMission();
  }

  saveMission() {
    this.submitted = true;

    if (!this.mission.id_user || !this.mission.client_id || !this.mission.date_debut || !this.mission.date_fin || this.mission.nombre_installation === undefined) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields', life: 3000 });
      return;
    }

    console.log('Mission data:', this.mission);

    if (this.mission.id) {
      this.missionService.updateMission(this.mission.id, this.mission).subscribe(() => {
        this.missions[this.findIndexById(this.mission.id)] = this.mission;
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Mission Updated', life: 3000 });
        this.refreshMissionList();
      });
    } else {
      this.mission.id = this.createId();
      this.missions.push(this.mission);
      this.missionService.insertData1(this.mission).subscribe(
        (data) => {
          console.log('Server response:', data);
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Mission Created', life: 3000 });
        },
        (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Mission creation failed', life: 3000 });
          console.error('Error creating mission:', error);
        }
      );
    }

    this.missions = [...this.missions];
    this.missionDialog = false;
  }

  refreshMissionList() {
    this.missionService.getData1().subscribe(data1 => this.missions = data1 as Mission[]);
  }

  findIndexById(id: string): number {
    let index = -1;
    for (let i = 0; i < this.missions.length; i++) {
      if (this.missions[i].id === id) {
        index = i;
        break;
      }
    }
    return index;
  }
  getMissionsByClient(clientId: any): Mission[] {
    return this.missions.filter(mission => mission.client_id === clientId);
  }

  createEmptyMission(): Mission {
    return {
      id: '',
      id_user: '',
      client_id: '',
      date_debut: '',
      date_fin: '',
      nombre_installation: 0,
      moyen: '',
      type_installation: '',
      status: ''
    };
  }

  createId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  onSort() {
    this.updateRowGroupMetaData();
  }

  updateRowGroupMetaData() {
    this.rowGroupMetadata = {};

    if (this.missions) {
      for (let i = 0; i < this.missions.length; i++) {
        const rowData = this.missions[i];
        const clientName = rowData.client_id;

        if (i === 0) {
          this.rowGroupMetadata[clientName] = { index: 0, size: 1 };
        } else {
          const previousRowData = this.missions[i - 1];
          const previousRowGroup = previousRowData.client_id;
          if (clientName === previousRowGroup) {
            this.rowGroupMetadata[clientName].size++;
          } else {
            this.rowGroupMetadata[clientName] = { index: i, size: 1 };
          }
        }
      }
    }
  }

  formatCurrency(value) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }
}
