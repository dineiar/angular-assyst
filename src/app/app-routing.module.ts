import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
    { path: 'auth', loadChildren: './auth/auth.module#AuthModule' },
    { path: 'dash', loadChildren: './dashboard/dashboard.module#DashboardModule' },
    { path: '', pathMatch: 'full', redirectTo: 'auth' },
    { path: '**', component: NotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
