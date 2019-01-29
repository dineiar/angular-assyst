import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { PreferencesService } from 'src/app/preferences.service';
import { AssystAPIService } from 'src/app/assyst/assyst-api.service';
import { AssystEvent } from 'src/app/assyst/assyst-dto';
import { LayoutHelperService } from 'src/app/layout-helper.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewChecked {
    autoCallback: boolean;
    eventCount: number;
    loadingEvents: boolean;
    events: AssystEvent[];

    queryProfileId = 141; // Chamados de acesso

    monitorIntervalSeconds: number = 5;
    monitorInterval = null;
    monitorRuns: number = 0;

    constructor(
        private preferences: PreferencesService,
        private assyst: AssystAPIService,
        private layoutHelper: LayoutHelperService,
    ) { }

    ngOnInit() {
        this.autoCallback = this.preferences.getPreference('autoCallback');
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
                this.events = data;
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
