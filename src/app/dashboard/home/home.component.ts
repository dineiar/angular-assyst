import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PreferencesService } from 'src/app/preferences.service';
import { AssystAPIService } from 'src/app/assyst/assyst-api.service';
import { AssystEvent } from 'src/app/assyst/assyst-dto';
import { LayoutHelperService, AlertLevels } from 'src/app/layout-helper.service';
import { AssystEventDatePipe } from '../assyst-event-date.pipe';
import { AssystPersonNamePipe } from '../assyst-person-name.pipe';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewChecked {
    autoCallback: boolean;
    notifyNewEvents: boolean;
    eventCount: number;
    loadingEvents: boolean;
    events: AssystEvent[] = null;

    assystEventDatePipe: AssystEventDatePipe = new AssystEventDatePipe();
    assystPersonNamePipe: AssystPersonNamePipe = new AssystPersonNamePipe();

    queryProfileId = 141; // Chamados de acesso

    monitorIntervalSeconds: number = 5;
    monitorInterval = null;
    monitorRuns: number = 0;

    constructor(
        private preferences: PreferencesService,
        public assyst: AssystAPIService,
        private layoutHelper: LayoutHelperService,
        private titleService: Title,
    ) { }

    ngOnInit() {
        this.titleService.setTitle('Chamados de acesso Assyst');
        this.autoCallback = this.preferences.getPreference('autoCallback');
        this.notifyNewEvents = this.preferences.getPreference('notifyNewEvents');
        // this.loadEvents();
        this.startEventsMonitor();
    }
    ngAfterViewChecked() {
        if (!this.loadingEvents) {
            // finished loading events
            this.layoutHelper.enableBootstrapComponents();
        }
    }

    autoCallbackChanged(): void {
        this.preferences.setPreference('autoCallback', this.autoCallback);
    }
    notifyNewEventsChanged(askPermission: boolean = true): void {
        if (!("Notification" in window)) {
            this.notifyNewEvents = false;
            this.layoutHelper.setAlert(AlertLevels.Warning, 'Este navegador não possui suporte à notificações.');
        } else {
            if (this.checkNotificationPermission() == 'denied') {
                this.notifyNewEvents = false;
                this.layoutHelper.setAlert(AlertLevels.Warning, 'O acesso à notificações está bloqueado.');
            }
        }
        this.preferences.setPreference('notifyNewEvents', this.notifyNewEvents);
    }
    checkNotificationPermission(permission?: string, askPermission: boolean = true): string {
        if (!permission) {
            permission = Notification.permission;
        }
        if (permission == 'default') {
            if (askPermission) {
                Notification.requestPermission(permission => {
                    this.notifyNewEventsChanged(false);
                });
            }
        }
        return permission;
    }
    newEvents(events: AssystEvent[]): void {
        if (this.notifyNewEvents) {
            events.forEach(evt => {
                var title = 'Novo chamado: ' + evt.formattedReference;
                var body = '';
                if (evt.alertStatus > 1) {
                    body += '[ALERTA] '
                }
                body += '[' + this.assystEventDatePipe.transform(evt.dateLogged) + ']';
                body += ' De ' + this.assystPersonNamePipe.transform(evt.reportingUserName);
                var not = new Notification(title, {
                    body: body,
                    icon: '/assets/images/axios_32x32.png',
                    // actions: []
                });
                not.onclick = () => {
                    var win = window.open(this.assyst.getLinkEvent(evt.id), '_blank');
                };
            })
        }
    }

    startEventsMonitor(): void {
        this.stopEventsMonitor();
        this.loadEvents();
        this.monitorInterval = setInterval(
            () => this.loadEvents(), 
            this.monitorIntervalSeconds*1000
        );
    }
    stopEventsMonitor(): void {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
        }
        this.monitorInterval = null;
    }

    loadEvents() {
        this.monitorRuns++;
        this.loadingEvents = true;
        this.assyst.getEventsByQueryProfile(this.queryProfileId)
            .subscribe((data: AssystEvent[]) => {
                // console.log('Events',data);
                if (this.events != null) { //we do not notify about the first get
                    this.newEvents(data.filter((evt) => {
                        for(var i = 0; i < this.events.length; i++) {
                            if (evt.id == this.events[i].id) {
                                return false;
                            }
                        }
                        return true;
                    }));
                }
                this.events = data;
                this.titleService.setTitle(data.length + ' chamados de acesso Assyst');
                this.loadingEvents = false;
                if (this.autoCallback) {
                    data.forEach((evt) => {
                        if (evt.callbackRequired) {
                            setTimeout(() => this.setUserCallback(evt), 2000);
                        }
                    })
                }
            });
    }

    setUserCallback(event: AssystEvent, remarks?: string): void {
        event.loadingCallback = true;
        this.assyst.setUserCallbackAction(event.id)
            .subscribe((data: any) => {
                event.callbackRequired = !data.actionSuccess;
                event.loadingCallback = false;
            },
            error => console.log('Error on setting callback', error));
    }
    assignToMe(event: AssystEvent) {
        event.loadingAssign = true;
        this.assyst.assignEventToLoggedUser(event.id)
            .subscribe((data: any) => {
                console.log('Assigned', data);
                event.loadingAssign = false;
            })
    }

    getPopoverContent(evt: AssystEvent, user: string) {
        switch (user) {
            case 'reporting':
                return '<div class="icon-text-aligned"><i class="material-icons">phone</i> <span>' + evt.reportingUserTelephoneExtension + '</span></div>';
            case 'affected':
                return '<div class="icon-text-aligned"><i class="material-icons">phone</i> <span>' + evt.affectedUserTelephoneExtension + '</span></div>';
        }
        return '';
    }

}
