import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssystAPIService } from 'src/app/assyst/assyst-api.service';
import { AssystUser } from '../assyst/assyst-dto';
import { LayoutHelperService } from '../layout-helper.service';

declare var $: any;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    public user: AssystUser;

    constructor(
        private router: Router,
        private assyst: AssystAPIService,
        public layoutHelper: LayoutHelperService
    ) { }

    ngOnInit() {
        this.user = this.assyst.getLoggedUser();
        if (!this.user) {
            this.router.navigate(['/auth']);
        }

        $(document).scroll(() => {
            if ($(document).scrollTop() > 100) {
                $('.navbar.navbar-onscroll.fixed-top').show();
            } else {
                $('.navbar.navbar-onscroll.fixed-top').hide();
            }
        });
        $(() => {
            $(document).trigger('scroll');
        });
    }

    logoff() {
        this.assyst.logoff();
        this.router.navigate(['/auth']);
    }
}
