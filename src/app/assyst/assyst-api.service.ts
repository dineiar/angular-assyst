import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AssystEvent, AssystUser, AssystKnowledge, AssystAttachment, AssystEventType, AssystEventSubType, AssystLinkedEventGroup, AssystPriority, AssystKnowledgeCategory } from './assyst-dto';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/app/storage.service';
import { Observable } from 'rxjs';
import { LayoutHelperService, AlertLevels } from '../layout-helper.service';

@Injectable({
    providedIn: 'root'
})
export class AssystAPIService {
    private url: string;
    private urlRest: string;
    private urlWeb: string;
    private urlWebApp: string;

    private priorities$: Observable<AssystPriority[]> = null;

    private knowledgeManagementServDeptId: number = null;

    private user: AssystUser = null;

    private onBehalfOfUser: string = null; //user login
    private onBehalfOfServDept: number = null;

    constructor(
        private http: HttpClient,
        private storage: StorageService,
        private layoutHelper: LayoutHelperService,
    ) {
        this.url = environment.assyst_host;
        this.urlRest = this.url + 'assystREST/v2/';
        this.urlWeb = this.url + 'assystweb/';
        this.urlWebApp = this.url + 'assystweb/application.do#';
    }

    initializeAssyst() {
        if (this.knowledgeManagementServDeptId == null) {
            var url = this.getRESTEndpoint('serviceDepartments', {
                'shortCode': 'GER CONHECIMENT',
            });
            this.http.get(url, this.getHttpOptions())
                .subscribe((data) => this.knowledgeManagementServDeptId = data[0].id)
        }
    }

    private setLoggedUser(user: AssystUser) {
        this.user = user;
        if (this.storage.enabled) {
            if (user) {
                this.storage.setItem('user', user);
            } else {
                this.storage.removeItem('user');
            }
        }

        if (user) {
            this.initializeAssyst();
        }
    }
    public getLoggedUser(): AssystUser {
        if (!this.user && this.storage.enabled) {
            this.setLoggedUser(this.storage.getItem('user'));
        }
        return this.user;
    }
    public isMicroinformatica(): boolean {
        return this.getLoggedUser() && this.getLoggedUser().servDeptId == 23;
    }

    public getRESTEndpoint(endpoint: string, parameters?: {}): string {
        var r = this.urlRest + endpoint;
        if (parameters) {
            var pars = [];
            for (var key in parameters) {
                pars.push(key + '=' + encodeURIComponent(parameters[key]));
            }
            if (pars) {
                r += '?' + pars.join('&');
            }
        }
        return r;
    }
    public getLinkViewKnowledge(knowledgeId: number): string {
        return this.urlWebApp + 'knowledge/DisplayKnowledge.do?dispatch=displayKnowledge&id=' + knowledgeId;
    }
    public getLinkEditKnowledge(knowledgeId: number): string {
        return this.urlWebApp + 'management/KnowledgeProcedure.do?dispatch=getPrimary&id=' + knowledgeId;
    }
    public getLinkEvent(eventId: number): string {
        return this.urlWebApp + 'event/DisplayEvent.do?dispatch=getEvent&checkJukeBoxSettings=true&eventId=' + eventId;
    }

    public getHttpHeaders(login?:string, password?:string): HttpHeaders {
        var authorizationHeader = null;
        if (login && password) {
            authorizationHeader = 'Basic ' + window.btoa(unescape(encodeURIComponent(login+':'+password)));
        } else {
            if (this.user) {
                authorizationHeader = this.user.authorizationHeader;
            }
        }

        var headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/json');
        if (authorizationHeader) {
            headers = headers.set('Authorization', authorizationHeader);
        }
        return headers;
    }
    private getHttpOptions(login?:string, password?:string) {
        return {
            headers: this.getHttpHeaders(login, password)
        };
    }
    private addBehalfsOnActionBody(body: any) {
        if (this.onBehalfOfUser) {
            body['actionedBy'] = {
                "resolvingParameters": [
                    {
                        "parameterName": "shortCode",
                        "parameterValue": this.onBehalfOfUser
                    }
                ]
            }
        }
        if (this.onBehalfOfServDept) {
            body['actioningServDept'] = {
                "resolvingParameters": [
                    {
                        "parameterName": "id",
                        "parameterValue": this.onBehalfOfServDept
                    }
                ]
            }
        }
    }
    
    public login(login: string, password: string, callback: any): void {
        var url = this.getRESTEndpoint('assystUsers', {'shortCode':login});
        var httpOpt = this.getHttpOptions(login, password);
        this.http.get<AssystUser[]>(url, httpOpt)
            .subscribe(
                (data: any) => {
                    console.log('Login', data);
                    if (data && data[0]) {
                        data[0].authorizationHeader = httpOpt.headers.get('Authorization');
                        this.setLoggedUser(data[0]);
                    } else {
                        this.setLoggedUser(null);
                    }
                    callback(this.getLoggedUser());
                },
                error => {
                    this.setLoggedUser(null);
                    callback(this.getLoggedUser());
                }
            );
    }
    public logoff() {
        this.setLoggedUser(null);
    }

    // Events
    public getEvent(eventId: number) {
        return this.http.get<AssystEvent>(
            this.getRESTEndpoint('events/' + eventId),
            this.getHttpOptions()
        );
    }
    public getEventsByQueryProfile(queryProfileId: number) {
        var url = this.getRESTEndpoint('events/queryProfiles/' + queryProfileId);
        return this.http.get<AssystEvent[]>(url, this.getHttpOptions());
    }
    public getEventReference(event: AssystEvent) {
        switch (event.eventType) {
            case AssystEventType.Incident:
                return "" + (event.id - 10000000);
            case AssystEventType.Problem:
                return "P" + event.id;
            case AssystEventType.Change:
                if (event.subEventType == AssystEventSubType.NormalStdChange) {
                    return "R" + (event.id - 5000000);
                } else {
                    return "S" + (event.id - 5000000);
                }
            case AssystEventType.Task:
                return "T" + (event.id - 10000000);
            case AssystEventType.DecisionTask:
                return "D" + (event.id - 10000000);
            case AssystEventType.AuthorizationTask:
                return "T" + (event.id - 10000000);
        }
    }
    public setUserCallbackAction(eventId: number, remarks?: string) {
        var url = this.getRESTEndpoint('actions');
        var body = {
            'eventId': eventId,
            'remarks': (remarks ? remarks : ''),
            'actionType': {
                'resolvingParameters': [{
                    'parameterName': 'shortCode',
                    'parameterValue': 'USER-CALLBACK',
                }]
            }
        };
        this.addBehalfsOnActionBody(body);
        return this.http.post(url, JSON.stringify(body), this.getHttpOptions());
    }
    public assignEventToLoggedUser(eventId: number, remarks?: string) {
        return this.assignEventTo(eventId, this.getLoggedUser().servDeptId, this.getLoggedUser().id, remarks);
    }
    public assignEventTo(eventId: number, servDeptId: number, userId: number, remarks?: string) {
        var url = this.getRESTEndpoint('actions');
        var body = {
            'eventId': eventId,
            'assignedServDeptId': servDeptId,
            'assignedUserId': userId,
            'remarks': (remarks ? remarks : ''),
            'actionType': {
                'resolvingParameters': [{
                    'parameterName': 'shortCode',
                    'parameterValue': 'ASSIGN',
                }]
            }
        };
        this.addBehalfsOnActionBody(body);
        return this.http.post(url, JSON.stringify(body), this.getHttpOptions());
    }
    public makeDecision(eventId: number, answer: string, remarks?: string) {
        var url = this.getRESTEndpoint('actions');
        var body = {
            'eventId': eventId,
            'remarks': (remarks ? remarks : ''),
            'decision': {
                'answer': answer,
            },
            'actionType': {
                'resolvingParameters': [{
                    'parameterName': 'shortCode',
                    'parameterValue': 'MAKE DECISION',
                }]
            }
        };
        this.addBehalfsOnActionBody(body);
        return this.http.post(url, JSON.stringify(body), this.getHttpOptions());
    }

    //Priorities/Urgency
    public getPriorities(callback): void {
        if (this.priorities$ == null) {
            var url = this.getRESTEndpoint('priorities');
            this.priorities$ = this.http.get<AssystPriority[]>(url, this.getHttpOptions());
        }
        this.priorities$.subscribe(callback);
    }

    // Knowledge
    public getKnowledge(knowledgeId: number): Observable<AssystKnowledge> {
        var url = this.getRESTEndpoint('knowledgeProcedures/' + knowledgeId, {
            'fields': 'draftSolution,draftProblem',
        });
        var options = this.getHttpOptions();
        // Doesn't work, https://wiki.axiossystems.com/assyst10SP7Wiki/index.php/assystREST#Returning_Data_URIs
        // options.headers = options.headers.append('X-assyst-img-inline', 'true');
        return this.http.get<AssystKnowledge>(url, options);
    }
    public getKnowledges(filters?: {}): Observable<AssystKnowledge[]> {
        if (!filters) filters = {};
        var url = this.getRESTEndpoint('knowledgeProcedures', filters);
        return this.http.get<AssystKnowledge[]>(url, this.getHttpOptions());
    }
    public getKnowledgeCategory(knowledgeCategoryId: number): Observable<AssystKnowledgeCategory> {
        var url = this.getRESTEndpoint('knowledgeProcedureCategories/' + knowledgeCategoryId);
        return this.http.get<AssystKnowledgeCategory>(url, this.getHttpOptions());
    }
    public getKnowledgeCategories(parentKnowledgeCategoryId?: number): Observable<AssystKnowledgeCategory[]> {
        var parms = {'discontinued': false};
        if (typeof parentKnowledgeCategoryId != 'undefined') {
            parms['parentKnowledgeProcedureCategoryId'] = parentKnowledgeCategoryId;
        }
        var url = this.getRESTEndpoint('knowledgeProcedureCategories', parms);
        return this.http.get<AssystKnowledgeCategory[]>(url, this.getHttpOptions());
    }
    public sortKnowledgeCategories(categories: AssystKnowledgeCategory[]) {
        return categories.sort((a, b) => {
            return a.sortOrder - b.sortOrder;
        });
    }
    public getKnowledgeAttachments(knowledgeId: number, ignoreInlineImages: boolean = true): Observable<AssystAttachment[]> {
        var options = this.getHttpOptions();
        // This doesn't work, https://wiki.axiossystems.com/assyst10SP7Wiki/index.php/assystREST#Searching
        let url = this.getRESTEndpoint('knowledgeProcedures/' + knowledgeId + '/attachments', ignoreInlineImages ? {'attachmentType[exclude]': 3,} : {});
        return this.http.get<AssystAttachment[]>(url, options);
    }
    public getKnowledgeAttachment(knowledgeId: number, attachmentId: number): Observable<AssystAttachment> {
        let url = this.getRESTEndpoint('knowledgeProcedures/' + knowledgeId + '/attachments/' + attachmentId);
        return this.http.get<AssystAttachment>(url, this.getHttpOptions());
    }
    public reviewKnowledge(knowledge: AssystKnowledge, approve: boolean, callback?: any) {
        if (knowledge.underReview && knowledge.lifecycleEventId) {
            var $this = this;
            var user = this.getLoggedUser();
                                
            this.onBehalfOfServDept = this.knowledgeManagementServDeptId;

            let remarks = ' para realizar revisão do conhecimento de id ' + knowledge.id
            
            // Busca o evento de Mudança Padrão criado para aprovação
            var lifecycleEvent$ = this.getEvent(knowledge.lifecycleEventId);
            // Busca eventos vinculados
            let url = this.getRESTEndpoint('linkedEventGroups', {
                'linkEventId': knowledge.lifecycleEventId,
                'linkReasonId': '14',
                'fields': 'linkedEvents',
            });
            // Já faz o request e deixa rodando
            var linkedEvents$ = this.http.get<AssystLinkedEventGroup[]>(url, this.getHttpOptions());
            
            lifecycleEvent$.subscribe((evt) => {
                    // Toma ciência e pega o chamado de Mudança Padrão criado para aprovação
                    if (evt.callbackRequired) {
                        this.setUserCallbackAction(evt.id, 'Tomando ciência' + remarks);
                    }
                    // Sempre dá erro nisso dizendo que não tem permissão.
                    // Já tentei atribuir com e sem onBehalfOf, mas sempre dá, então tentamos mas ignoramos se der erro.
                    // this.assignEventTo(knowledge.lifecycleEventId, this.knowledgeManagementServDeptId, user.id, 'Atribuindo' + remarks)
                    this.assignEventToLoggedUser(knowledge.lifecycleEventId, 'Atribuindo' + remarks)
                    
                    linkedEvents$.subscribe((linkedEventGroups) => {
                        // Deve haver apenas 1 vínculo
                        linkedEventGroups[0].linkedEvents.forEach(evt => {
                            if (evt.linkedEventId != knowledge.lifecycleEventId) {
                                // let urlAvailableActions = this.getRESTEndpoint('events/' + evt.linkedEventId + '/availableActionTypes/' + this.knowledgeManagementServDeptId);
                                // this.http.get(urlAvailableActions, this.getHttpOptions())
                                //     .subscribe((actionTypes) => {
                                //         console.log('Available actions for event', evt.linkedEventId, 'and sector', this.knowledgeManagementServDeptId, actionTypes);
                                //     });
                                
                                this.assignEventTo(evt.linkedEventId, this.knowledgeManagementServDeptId, user.id, 'Atribuindo' + remarks)
                                    .subscribe(
                                        data => {
                                            this.makeDecision(evt.linkedEventId, approve ? 'Sim' : 'Não', 'Revisando o conhecimento de id ' + knowledge.id)
                                                .subscribe(
                                                    data => {
                                                        $this.onBehalfOfServDept = null;
                                                        callback ? callback(true, data) : null;
                                                    },
                                                    error => {
                                                        console.log('Erro ao tomar a decisão', error);
                                                        $this.layoutHelper.setAlert(AlertLevels.Danger, 'Erro ao aprovar/rejeitar o conhecimento ' + knowledge.id);
                                                        callback ? callback(false, error) : null;
                                                    }
                                                );
                                        },
                                        error => {
                                            console.log('Erro ao atribuir chamado de decisão para si', error);
                                            $this.layoutHelper.setAlert(AlertLevels.Danger, 'Erro ao atribuir o chamado de aprovação do conhecimento ' + knowledge.id);
                                            callback ? callback(false, error) : null;
                                        }
                                    );
    
                            }
                        });
                    });
                })
        }
    }

}
