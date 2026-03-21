import { Routes } from '@angular/router';
import { AccountPage } from './pages/account-page/account-page';
import { BusinessProfilesPage } from './pages/business-profiles-page/business-profiles-page';
import { ProspectsPage } from './pages/prospects-page/prospects-page';
import { DashboardAdmin } from './pages/dashboard-admin/dashboard-admin';
import { LoginPage } from './pages/login-page/login-page';
import { ModelPage } from './pages/model-page/model-page';
import { ProspectsForm } from './pages/prospects-form/prospects-form';
import { loginGuard } from './guards/login-guard';
import { adminGuard } from './guards/admin-guard-guard';
import { HomePage } from './pages/home-page/home-page';
import { alreadyLoggedInGuard } from './guards/already-logged-in-guard';

export const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'home', component: HomePage},
    {path: 'dashboard', component: DashboardAdmin, canActivate: [loginGuard, adminGuard]},
    {path: 'my-account', component: AccountPage, canActivate: [loginGuard]},
    {path: 'business-profiles', component: BusinessProfilesPage, canActivate: [loginGuard]},
    {path: 'prospects', component: ProspectsPage, canActivate: [loginGuard]},
    {path: 'prospects/new', component: ProspectsForm, canActivate: [loginGuard]},
    {path: 'login', component: LoginPage, canActivate: [alreadyLoggedInGuard]},
    {path: 'ai-model', component: ModelPage, canActivate: [loginGuard, adminGuard]},
];
