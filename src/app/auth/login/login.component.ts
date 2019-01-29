import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssystAPIService } from 'src/app/assyst/assyst-api.service';
import { LayoutHelperService,AlertLevels } from 'src/app/layout-helper.service';
import { AssystUser } from 'src/app/assyst/assyst-dto';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    username: string;
    password: string;

    constructor(
        private router: Router,
        private assyst: AssystAPIService, 
        public layoutHelper: LayoutHelperService
    ) { }

    ngOnInit() {
        if (this.assyst.getLoggedUser()) {
            this.router.navigate(['/dash']);
        }
    }

    authenticate(): void {
        console.log('Login attempt for', this.username);
        let $this = this;
        this.assyst.login(this.username, this.password, function(user: AssystUser) {
            if (user) {
                $this.router.navigate(['/dash']);
            } else {
                $this.layoutHelper.setAlert(AlertLevels.Danger, 'Usuário ou senha inválidos');
            }
        });
    }

}
