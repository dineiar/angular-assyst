import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AssystAPIService } from 'src/app/assyst/assyst-api.service';
import { AssystKnowledgeCategory } from 'src/app/assyst/assyst-dto';

@Component({
    selector: 'app-knowledge-list',
    templateUrl: './knowledge-list.component.html'
})
export class KnowledgeListComponent implements OnInit {
    public loading: boolean;
    public categories: AssystKnowledgeCategory[];
    public selectedKnowledgeId: number;

    constructor(
        private router: Router,
        private assyst: AssystAPIService,
        private titleService: Title
    ) { }

    ngOnInit() {
        this.loading = true;
        this.loadCategories();
        this.titleService.setTitle('Conhecimentos Assyst');
    }

    loadCategories() {
        this.loading = true;
        this.assyst.getKnowledgeCategories(0) //0 is root
            .subscribe(categories => {
                this.categories = this.assyst.sortKnowledgeCategories(categories);
                this.loading = false;
            })
    }

    selectKnowledge(knowledgeId: number) {
        this.selectedKnowledgeId = knowledgeId;
    }

    knowledgeIdSubmit() {
        this.router.navigate(['/dash/knowledge', this.selectedKnowledgeId]);
    }
}
