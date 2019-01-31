import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AssystKnowledgeCategory, AssystKnowledge } from 'src/app/assyst/assyst-dto';
import { AssystAPIService } from 'src/app/assyst/assyst-api.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-knowledge-list-tree-view',
    templateUrl: './knowledge-list-tree-view.component.html'
})
export class KnowledgeListTreeViewComponent implements OnInit {
    public loading: boolean;
    @Input() categories: AssystKnowledgeCategory[];
    @Input() knowledges: AssystKnowledge[];
    @Output() knowledgeSelected = new EventEmitter<number>();

    constructor(
        private assyst: AssystAPIService
    ) { }

    ngOnInit() { }

    loadChildCategories(parentCategory: AssystKnowledgeCategory) {
        if (parentCategory.childrenCategories != null) {
            // already loaded, toggle visibility
            parentCategory.showingChildren = !parentCategory.showingChildren;
        } else {
            parentCategory.showingChildren = true;
            parentCategory.loadingChildren = true;
            this.assyst.getKnowledgeCategories(parentCategory.id)
                .subscribe(categories => {
                    parentCategory.childrenCategories = this.assyst.sortKnowledgeCategories(categories);
                    parentCategory.loadingChildren = (
                        parentCategory.childrenCategories == null || parentCategory.childrenKnowledges == null
                    );
                });
            var filters = {'categoryId': parentCategory.id};
            if (environment.ignore_retired_knowledge) {
                filters['discontinued'] = false;
            }
            this.assyst.getKnowledges(filters)
                .subscribe(knowledges => {
                    parentCategory.childrenKnowledges = knowledges;
                    parentCategory.loadingChildren = (
                        parentCategory.childrenCategories == null || parentCategory.childrenKnowledges == null
                    );
                })
        }
    }

    selectKnowledge(knowledgeId: number) {
        this.knowledgeSelected.emit(knowledgeId);
    }

}
