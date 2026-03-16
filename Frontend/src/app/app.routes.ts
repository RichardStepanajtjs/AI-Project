import { Routes } from '@angular/router';
import { AccountPage } from './pages/account-page/account-page';
import { BusinessProfilesPage } from './pages/business-profiles-page/business-profiles-page';
import { ProspectsPage } from './pages/prospects-page/prospects-page';
import { DashboardAdmin } from './pages/dashboard-admin/dashboard-admin';
import { LoginPage } from './pages/login-page/login-page';
import { ModelPage } from './pages/model-page/model-page';
import { ProspectsForm } from './pages/prospects-form/prospects-form';

export const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {path: 'dashboard', component: DashboardAdmin},
    {path: 'my-account', component: AccountPage},
    {path: 'business-profiles', component: BusinessProfilesPage},
    {path: 'prospects', component: ProspectsPage},
    {path: 'prospects/new', component: ProspectsForm},
    {path: 'login', component: LoginPage},
    {path: 'ai-model', component: ModelPage},
];
