import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard.component';
import { KnowledgeComponent } from './knowledge/knowledge.component';
import { KnowledgeListComponent } from './knowledge-list/knowledge-list.component';

const routes: Routes = [
    { path: '', component: DashboardComponent, children: [
        { path: '', component: HomeComponent },
        { path: 'knowledge', component: KnowledgeListComponent },
        { path: 'knowledge/:id', component: KnowledgeComponent },
    ] }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
