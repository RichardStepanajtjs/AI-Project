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
  showScreen: boolean = false;
  errorMessage = '';
  usersService = inject(UsersService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  users: User[] = [];
  new_user = {} as User;
  aantal_gebruikers = this.users.length;
  // aantal_actieve_gebruikers = this.users.filter(user => user.active).length;
  aantal_admins = this.users.filter(user => user.role === 'Admin').length;

  ngOnInit() {
    this.usersService.getAllUsers().subscribe({
      next: (response: any) => {
        this.users = [...response.data] as User[];
        this.aantal_gebruikers = this.users.length;
        // this.aantal_actieve_gebruikers = this.users.filter(user => user.active).length;
        this.aantal_admins = this.users.filter(user => user.role === 'Admin').length;
        this.cdr.detectChanges();
        console.log(response.data);
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Fout bij het laden van gebruikers.';
      }
    });
  }

  // toggleActive(user: User) {
  //   user.active = !user.active;
  // }

  hideAddUserScreen() {
    this.showScreen = false;
  }

  addUser() {
    this.usersService.createUser(this.new_user).subscribe({
      next: () => {
        this.showScreen = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Fout bij creëren van gebruiker.';
      }
    });
  }
}
