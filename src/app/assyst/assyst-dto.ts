
export enum AssystEventType {
    Incident = 1,
    Problem = 2,
    Change = 4, //includes Service Requests
    Task = 8,
    DecisionTask = 16,
    AuthorizationTask = 32,
}
export enum AssystEventSubType {
    NormalStdChange = 1, //Mudança Padrão when EventType == Change
    ChangeServiceRequest = 2, //only when EventType == Change
    ChangeOrder = 3 //only when EventType == Change
}
export class AssystEvent {
    public id: number;
    public formattedReference: string;
    public reportingUserName: string;
    public reportingUserTelephoneExtension: string;
    public affectedUserName: string;
    public affectedUserTelephoneExtension: string;
    public dateLogged: string;
    public callbackRequired: boolean;
    public callbackRemark: string;
    public alertStatus: number;
    public eventType: AssystEventType;
    public subEventType: AssystEventSubType;

    public loadingCallback: boolean = false;
    public loadingAssign: boolean = false;
}

export class AssystLinkedEventGroup {
    public id: number;
    public linkDate: string;
    public linkGroupRemarks: string;
    public linkReasonId: number;
    public linkedEvents: AssystLinkedEvent[];
}
export class AssystLinkedEvent {
    public entityDefinitionType: number;
    public id: number; //id do evento
    public linkDate: string;
    public linkedEventId: number;
}

export class AssystPriority {
    public id: number;
    public sortOrder: number;
    public name: string;
    public shortName: string;
    
    public incident: boolean;
    public problem: boolean;
    public change: boolean;
    public task: boolean;
    public serviceRequest: boolean;
    public order: boolean;
    public systemRecord: boolean;
    public anonymousRecord: boolean;
    public record: boolean;
}

export class AssystKnowledgeCategory {
    public id: number;
    public name: string;
    public businessTitle: string;
    public sortOrder: number;
    public parentKnowledgeProcedureCategoryId: number;

    public showingChildren: boolean = false;
    public loadingChildren: boolean = false;
    public childrenCategories: AssystKnowledgeCategory[] = null;
    public childrenKnowledges: AssystKnowledge[] = null;
}

export class AssystKnowledge {
    public id: number;
    public name: string;
    public viewCount: number;
    public problem: any;
    public solution: any;
    public reviewComments: string;
    public procedureStatus: number;
    public modifyDate: Date;
    public underReview: boolean; //sob revisão
    public lifecycleEventId: number; //evento de aprovação
    public discontinued: boolean; //obsoleto
    public knowledgeProcedureCategoryId: number;
    
    public draftName: any;
    public draftProblem: any;
    public draftSolution: any;
    public draftProcedureStatus: number;
    public draftDiscontinued: boolean;

    // public attachments: AssystAttachment[];
}
export class AssystAttachment {
    public id: number;
    public name: string;
    public fileName: string;
    public description: string;
    public attachmentType: number;

    public attachment: string; //content in base64

    public loadingDownload: boolean = false;
}

export class AssystUser {
    public id: number;
    public servDeptId: number; //setor do usuário
    public name: string;
    public authorizationHeader: string;

    constructor () { }
}