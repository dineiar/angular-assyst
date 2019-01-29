import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AssystKnowledge, AssystAttachment, AssystKnowledgeCategory } from 'src/app/assyst/assyst-dto';
import { AssystAPIService } from 'src/app/assyst/assyst-api.service';
import { Observable, of } from 'rxjs';
import { LayoutHelperService, AlertLevels } from 'src/app/layout-helper.service';
import { Title } from '@angular/platform-browser';

declare var $: any;

enum KnowledgeVersion {
    Published,
    Draft
    // Both
}

@Component({
    selector: 'app-knowledge',
    templateUrl: './knowledge.component.html',
    styleUrls: ['./knowledge.component.scss']
})
export class KnowledgeComponent implements OnInit {
    @Input('knowledgeId') knowledgeIdParm: number;
    public loadingKnowledge: boolean;
    public knowledge$: Observable<AssystKnowledge>;
    public knowledgeAttachments: AssystAttachment[] = null;
    public knowledgeCategories: AssystKnowledgeCategory[] = [];

    public readonly knowledgeVersion = KnowledgeVersion;
    public viewVersion: KnowledgeVersion = KnowledgeVersion.Published;

    constructor(
        private route: ActivatedRoute,
        private assyst: AssystAPIService,
        public layoutHelper: LayoutHelperService,
        private titleService: Title
    ) {}

    ngOnInit() {
        this.loadingKnowledge = true;
        // this.knowledge$ = this.route.paramMap.pipe(
        //     switchMap((params: ParamMap) => 
        //         this.assyst.getKnowledge(+params.get('id')) //+ cast to number
        //     )
        // );
        var knowledgeId$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) => of(+params.get('id')))
        );
        knowledgeId$.subscribe(id => {
            if (id) this.loadKnowledge(id);
        });
    }
    ngOnChanges(changes: SimpleChanges) {
        console.log('Changes', changes)
        if (this.knowledgeIdParm) {
            this.loadKnowledge(this.knowledgeIdParm);
        }
    }

    loadKnowledge(knowledgeId: number) {
        this.loadingKnowledge = true;
        this.knowledge$ = this.assyst.getKnowledge(knowledgeId);
        this.knowledge$.subscribe(
            knowledge => {
                this.loadKnowledgeBreadcrumb(knowledge.knowledgeProcedureCategoryId);
                this.loadingKnowledge = false;
                this.titleService.setTitle('Conhecimento ' + knowledge.name);
                setTimeout(function() {
                    $('#single-knowledge')[0].focus({'preventScroll':true});
                }, 1000);
                console.log('Knowledge log:', knowledge);
            },
            error => {
                this.loadingKnowledge = false;
                console.log('Falha no carregamento do conhecimento', knowledgeId, error);
                this.layoutHelper.setAlert(AlertLevels.Danger, 'Falha no carregamento do conhecimento de id ' + knowledgeId);
            }
        );

        this.loadKnowledgeAttachments(knowledgeId);

        return this.knowledge$;
    }
    loadKnowledgeAttachments(knowledgeId: number) {
        this.knowledgeAttachments = null;
        this.assyst.getKnowledgeAttachments(knowledgeId)
            .subscribe(attachments => {
                this.knowledgeAttachments = attachments.filter(function(a) {
                    return a.attachmentType != 3; //inline images
                });
                // console.log('Attachments', attachments);
            });
    }
    loadKnowledgeBreadcrumb(knowledgeProcedureCategoryId: number) {
        this.knowledgeCategories = [];
        this.loadKnowledgeBreadcrumbRecursive(knowledgeProcedureCategoryId);
    }
    loadKnowledgeBreadcrumbRecursive(knowledgeProcedureCategoryId: number) {
        this.assyst.getKnowledgeCategory(knowledgeProcedureCategoryId)
            .subscribe(category => {
                console.log('category', category);
                this.knowledgeCategories.unshift(category);
                if (category.parentKnowledgeProcedureCategoryId) {
                    this.loadKnowledgeBreadcrumbRecursive(category.parentKnowledgeProcedureCategoryId);
                }
            });
    }

    isModified(knowledge: AssystKnowledge): boolean {
        return (knowledge.name != knowledge.draftName)
            || (knowledge.problem.content != knowledge.draftProblem.content)
            || (knowledge.solution.content != knowledge.draftSolution.content)
            || (knowledge.discontinued != knowledge.draftDiscontinued)
        ;
    }
    getAssystLink(knowledgeId: number) {
        return this.assyst.getLinkEditKnowledge(knowledgeId);
    }
    downloadAttachment(knowledge: AssystKnowledge, attachment: AssystAttachment) {
        if (!attachment.loadingDownload) {
            if (attachment.attachment) {
                // Se o usuário já baixou esse arquivo, baixa direto da memória
                this.layoutHelper.downloadBase64File(attachment.fileName, attachment.attachment);
            } else {
                attachment.loadingDownload = true;
                this.assyst.getKnowledgeAttachment(knowledge.id, attachment.id)
                    .subscribe((ret) => {
                        // Salva o arquivo em memória pra baixar sem precisar requisitar se o usuário clicar de novo
                        attachment.attachment = ret.attachment;

                        this.layoutHelper.downloadBase64File(attachment.fileName, ret.attachment);
                        attachment.loadingDownload = false;
                    });
            }
        }
    }
    approveKnowledge(knowledge: AssystKnowledge) {
        if (confirm('Deseja aprovar as alterações no conhecimento?')) {
            var $this = this;
            this.loadingKnowledge = true;
            this.assyst.reviewKnowledge(knowledge, true, function(success: boolean, ret: any) {
                $this.reviewKnowledgeCallback(knowledge, true, success, ret);
            });
        }
    }
    rejectKnowledge(knowledge: AssystKnowledge) {
        if (confirm('Deseja rejeitar as alterações no conhecimento?\n(as alterações permanecerão como rascunho)')) {
            this.loadingKnowledge = true;
            var $this = this;
            this.assyst.reviewKnowledge(knowledge, false, function(success: boolean, ret: any) {
                $this.reviewKnowledgeCallback(knowledge, false, success, ret);
            });
        }
    }
    reviewKnowledgeCallback(knowledge: AssystKnowledge, approve: boolean, success: boolean, ret: any) {
        if (success) {
            if (approve) this.layoutHelper.setAlert(AlertLevels.Success, 'Conhecimento aprovado com sucesso');
            else this.layoutHelper.setAlert(AlertLevels.Success, 'Alterações no conhecimento rejeitadas com sucesso');
        } else {
            this.layoutHelper.setAlert(AlertLevels.Danger, 'Falha ao ' + (approve ? 'aprovar' : 'rejeitar') + ' o conhecimento')
            console.log('Falha ao ' + (approve ? 'aprovar' : 'rejeitar') + ' o conhecimento', ret);
        }
        this.loadKnowledge(knowledge.id);
    }

    setViewDraft(): void {
        this.viewVersion = KnowledgeVersion.Draft;
    }
    viewDraft(): boolean {
        return this.viewVersion == KnowledgeVersion.Draft
            // || this.viewVersion == KnowledgeVersion.Both
            ;
    }
    setViewPublished(): void {
        this.viewVersion = KnowledgeVersion.Published;
    }
    viewPublished(): boolean {
        return this.viewVersion == KnowledgeVersion.Published
            // || this.viewVersion == KnowledgeVersion.Both
            ;
    }
    toggleViewVersion(): void {
        if (this.viewVersion == KnowledgeVersion.Draft) {
            this.setViewPublished();
        } else if (this.viewVersion == KnowledgeVersion.Published) {
            this.setViewDraft();
        }
    }
    keyPress($event: KeyboardEvent): void {
        if ($event.key == 'v' || $event.key == 'V') {
            this.toggleViewVersion();
        } else if ($event.key == 'ArrowLeft') {
            this.setViewPublished();
        } else if ($event.key == 'ArrowRight') {
            this.setViewDraft();
        }
    }

    // ngAfterViewChecked() {
        // $('img', '#single-knowledge').on('mouseenter', function(evt) {
        //     console.log('in', evt);
        // });
        // $('img', '#single-knowledge').hover(function(a,b,c) {
        //     console.log('in', a,b,c);
        // }, function(a,b,c) {
        //     console.log('out', a,b,c);
        // });
        // this.knowledge$.
    // }

}
