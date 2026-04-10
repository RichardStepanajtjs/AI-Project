import { Routes } from '@angular/router';
import { AccountPage } from './pages/account-page/account-page';
import { BusinessProfilesPage } from './pages/business-profiles-page/business-profiles-page';
import { BusinessProfileDetailPage } from './pages/business-profile-detail-page/business-profile-detail-page';
import { ProspectsPage } from './pages/prospects-page/prospects-page';
import { ProspectDetailPage } from './pages/prospect-detail-page/prospect-detail-page';
import { DashboardAdmin } from './pages/dashboard-admin/dashboard-admin';
import { LoginPage } from './pages/login-page/login-page';
import { ModelPage } from './pages/model-page/model-page';
import { loginGuard } from './guards/login-guard';
import { adminGuard } from './guards/admin-guard-guard';
import { HomePage } from './pages/home-page/home-page';
import { LandingPage } from './pages/landing-page/landing-page';
import { alreadyLoggedInGuard } from './guards/already-logged-in-guard';

export const routes: Routes = [
    {path: '', component: LandingPage, canActivate: [alreadyLoggedInGuard]},
    {path: 'home', component: HomePage, canActivate: [loginGuard]},
    {path: 'dashboard', component: DashboardAdmin, canActivate: [loginGuard, adminGuard]},
    {path: 'my-account', component: AccountPage, canActivate: [loginGuard]},
    {path: 'business-profiles', component: BusinessProfilesPage, canActivate: [loginGuard]},
    {path: 'business-profiles/:kbonummer', component: BusinessProfileDetailPage, canActivate: [loginGuard]},
    {path: 'prospects', component: ProspectsPage, canActivate: [loginGuard]},
    {path: 'prospects/:id', component: ProspectDetailPage, canActivate: [loginGuard]},
    {path: 'login', component: LoginPage, canActivate: [alreadyLoggedInGuard]},
    {path: 'ai-model', component: ModelPage, canActivate: [loginGuard, adminGuard]},
];
