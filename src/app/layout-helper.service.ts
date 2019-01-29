import { Injectable,EventEmitter } from '@angular/core';

declare var $: any;

@Injectable({
    providedIn: 'root'
})
export class LayoutHelperService {
    private alerts: Alert[] = [];
    // public htmlLoaded: EventEmitter<void> = new EventEmitter<void>();

    constructor() { }

    public setAlert(level:AlertLevels, message:string) {
        this.alerts.push(new Alert(level, message));
    }

    public getAlerts() {
        return this.alerts;
    }

    public enableBootstrapComponents() {
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();
    };


    private elem = document.createElement('textarea');
    public decodeHTML(encoded: string) : string {
        this.elem.innerHTML = encoded;
        return this.elem.value;
    }

    public nl2br(str: string, is_xhtml: boolean) {
        if (typeof str === 'undefined' || str === null) {
            return '';
        }
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }

    public downloadBase64File(fileName: string, content: string) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8;base64,' + encodeURIComponent(content));
        element.setAttribute('download', fileName);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
    
}

export enum AlertLevels {
    Info,
    Success,
    Warning,
    Danger,
}
export class Alert {
    private level: AlertLevels;
    private message: string;
    
    constructor(level:AlertLevels, message:string) {
        this.level = level;
        this.message = message;
    }

    getLevel() { return this.level; }
    getCSSClass() {
        switch (this.level) {
            case AlertLevels.Info: return 'alert-info';
            case AlertLevels.Success: return 'alert-success';
            case AlertLevels.Warning: return 'alert-warning';
            case AlertLevels.Danger: return 'alert-danger';
        }
    }
    getIcon() {
        switch (this.level) {
            case AlertLevels.Info: return 'info';
            case AlertLevels.Success: return 'check';
            case AlertLevels.Warning: return 'warning';
            case AlertLevels.Danger: return 'error_outline';
        }
    }
    getPrefix() {
        switch (this.level) {
            case AlertLevels.Info: return 'Informação';
            case AlertLevels.Success: return 'Sucesso';
            case AlertLevels.Warning: return 'Alerta';
            case AlertLevels.Danger: return 'Erro';
        }
    }
    getMessage() { return this.message; }
}