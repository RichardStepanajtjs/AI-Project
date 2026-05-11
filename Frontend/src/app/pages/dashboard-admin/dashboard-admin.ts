import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { PageHeader } from "../../page-components/page-header/page-header";
import { Router } from '@angular/router';
import { UsersService } from '../../services/users/users-service';
import { User } from '../../models/user';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-dashboard-admin',
  imports: [PageHeader, FormsModule],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css',
})
export class DashboardAdmin {
  showScreen = false;
  showUserDetail = false;
  showDeleteConfirm = false;
  editMode = false;
  editData: Partial<User> = {};
  editPassword = '';
  errorMessage = '';

  usersService = inject(UsersService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  
  users: User[] = [];
  new_user = {} as User;
  selectedUser: User | null = null;
  
  aantal_gebruikers = 0;
  aantal_admins = 0;
  aantal_actieve = 0;
  
  currentSortKey: string = '';
  searchTerm: string = '';
  isAscending: boolean = true;

  get filteredUsers() {
    const search = this.searchTerm.toLowerCase().trim();
    
    return this.users.filter(user => {
      const emailMatch = user.email.toLowerCase().includes(search);
      // const nameMatch = user.name ? user.name.toLowerCase().includes(search) : false;
      
      return emailMatch /*|| nameMatch*/;
    });
  }
  
  ngOnInit() {
    this.usersService.getAllUsers().subscribe({
      next: (response: any) => {
        this.users = (response.data as User[]).map(u => ({ ...u, active: u.active ?? true }));
        this.updateStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Fout bij het laden van gebruikers.';
      }
    });
  }

  private updateStats() {
    this.aantal_gebruikers = this.users.length;
    this.aantal_admins = this.users.filter(u => u.role?.toLowerCase() === 'admin').length;
    this.aantal_actieve = this.users.filter(u => u.active !== false).length;
  }

  openDetail(user: User) {
    this.selectedUser = { ...user };
    this.showUserDetail = true;
    this.showDeleteConfirm = false;
  }

  closeDetail() {
    this.showUserDetail = false;
    this.selectedUser = null;
    this.showDeleteConfirm = false;
    this.editMode = false;
    this.editData = {};
    this.editPassword = '';
  }

  startEdit() {
    if (!this.selectedUser) return;
    this.editData = { email: this.selectedUser.email, role: this.selectedUser.role, active: this.selectedUser.active };
    this.editPassword = '';
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
    this.editData = {};
    this.editPassword = '';
  }

  saveEdit() {
    if (!this.selectedUser?.id) return;
    const updated: User = {
      ...this.selectedUser,
      email: this.editData.email ?? this.selectedUser.email,
      role: this.editData.role ?? this.selectedUser.role,
      active: this.editData.active ?? this.selectedUser.active,
      password: this.editPassword || this.selectedUser.password,
    };
    this.usersService.updateUser(this.selectedUser.id, updated).subscribe({
      next: () => {
        const idx = this.users.findIndex(u => u.id === this.selectedUser!.id);
        if (idx !== -1) this.users[idx] = updated;
        this.selectedUser = updated;
        this.updateStats();
        this.editMode = false;
        this.editData = {};
        this.editPassword = '';
        this.cdr.detectChanges();
      },
      error: () => {
        const idx = this.users.findIndex(u => u.id === this.selectedUser!.id);
        if (idx !== -1) this.users[idx] = updated;
        this.selectedUser = updated;
        this.updateStats();
        this.editMode = false;
        this.editData = {};
        this.editPassword = '';
        this.cdr.detectChanges();
      }
    });
  }

  toggleStatus(user: User, event?: Event) {
    event?.stopPropagation();
    const updated = { ...user, active: !user.active };
    if (user.id) {
      this.usersService.updateUser(user.id, updated).subscribe({
        next: () => {
          const idx = this.users.findIndex(u => u.email === user.email);
          if (idx !== -1) this.users[idx] = updated;
          if (this.selectedUser?.email === user.email) this.selectedUser = updated;
          this.cdr.detectChanges();
        },
        error: () => {
          const idx = this.users.findIndex(u => u.email === user.email);
          if (idx !== -1) this.users[idx] = updated;
          if (this.selectedUser?.email === user.email) this.selectedUser = updated;
          this.cdr.detectChanges();
        }
      });
    } else {
      const idx = this.users.findIndex(u => u.email === user.email);
      if (idx !== -1) this.users[idx] = updated;
      if (this.selectedUser?.email === user.email) this.selectedUser = updated;
      this.cdr.detectChanges();
    }
  }

  deleteUser(user: User, event?: Event) {
    event?.stopPropagation();
    if (user.id) {
      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.email !== user.email);
          this.updateStats();
          this.closeDetail();
          this.cdr.detectChanges();
        },
        error: () => {
          this.users = this.users.filter(u => u.email !== user.email);
          this.updateStats();
          this.closeDetail();
          this.cdr.detectChanges();
        }
      });
    } else {
      this.users = this.users.filter(u => u.email !== user.email);
      this.updateStats();
      this.closeDetail();
      this.cdr.detectChanges();
    }
  }

  addUser() {
    this.usersService.createUser(this.new_user).subscribe({
      next: () => {
        this.showScreen = false;
        this.usersService.getAllUsers().subscribe({
          next: (response: any) => {
            this.users = (response.data as User[]).map(u => ({ ...u, active: u.active ?? true }));
            this.updateStats();
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Fout bij creëren van gebruiker.';
      }
    });
  }

  sortUsers(key: string) {
    if (this.currentSortKey === key) {
      this.isAscending = !this.isAscending;
    } else {
      this.currentSortKey = key;
      this.isAscending = true;
    }

    this.users.sort((a: any, b: any) => {
      let valA = a[key];
      let valB = b[key];

      if (key === 'active') {
        valA = valA ? 1 : 0;
        valB = valB ? 1 : 0;
      } else {
        valA = valA?.toString().toLowerCase();
        valB = valB?.toString().toLowerCase();
      }

      if (valA < valB) return this.isAscending ? -1 : 1;
      if (valA > valB) return this.isAscending ? 1 : -1;
      return 0;
    });
  }
  
}
