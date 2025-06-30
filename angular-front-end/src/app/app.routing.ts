import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Components
import { LoginComponent } from './login/login.component';
import { AccountsTableComponent } from "./accounts-table/accounts-table.component";
import { AnomaliesComponent } from "./anomalies/anomalies.component";
import { RegisterComponent } from "./register/register.component";
import { AnalyticsComponent } from "./analytics/analytics.component";
import { StatisticsComponent } from "./statistics/statistics.component";
import { AuthGuard } from "./utils/auth.guard";

export const ROUTES: Routes = [
    { path: 'accounts', component: AccountsTableComponent, canActivate: [AuthGuard] },
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'anomalies', component: AnomaliesComponent, canActivate: [AuthGuard] },
    { path: 'analytics', component: AnalyticsComponent, canActivate: [AuthGuard] },
    { path: 'statistics', component: StatisticsComponent }
];

export const ROUTING: ModuleWithProviders<any> = RouterModule.forRoot(ROUTES);
