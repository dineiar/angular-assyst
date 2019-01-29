import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard.component';
import { KnowledgeComponent } from './knowledge/knowledge.component';
import { AssystEventDatePipe } from './assyst-event-date.pipe';
import { AssystPersonNamePipe } from './assyst-person-name.pipe';
import { SafeHtmlPipe } from './safe-html.pipe';
import { AssystFixHtmlPipe } from './assyst-fix-html.pipe';
import { Nl2BrPipe } from './nl2br.pipe';
import { KnowledgeListComponent } from './knowledge-list/knowledge-list.component';
import { KnowledgeListTreeViewComponent } from './knowledge-list/tree-view/knowledge-list-tree-view.component';

@NgModule({
    declarations: [
        HomeComponent,
        DashboardComponent,
        KnowledgeComponent,
        AssystEventDatePipe,
        AssystPersonNamePipe,
        SafeHtmlPipe,
        AssystFixHtmlPipe,
        Nl2BrPipe,
        KnowledgeListComponent,
        KnowledgeListTreeViewComponent
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class DashboardModule { }
