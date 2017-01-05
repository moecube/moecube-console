import {Component, OnInit} from '@angular/core';
import App from '../models/browserapp';
import {AppService} from './app.service';
import {MdDialog, MdSnackBar} from '@angular/material';
import {AppCreateComponent} from './app-create.component';
import {Router} from '@angular/router';

@Component({
    selector: 'apps',
    moduleId: module.id,
    templateUrl: 'apps.component.html',
    styleUrls: ['apps.component.css']
})
export class AppsComponent implements OnInit {
    apps: App[];

    constructor(private appService: AppService, private dialog: MdDialog, private snackBar: MdSnackBar, private router: Router) {
    }

    async ngOnInit() {
        await this.getApps();
    }

    async getApps() {
        this.apps = await this.appService.getApps();
    }

    async create_app() {
        let dialogRef = this.dialog.open(AppCreateComponent);
        let app: App | undefined = await dialogRef.afterClosed().toPromise();
        if (!app) {
            return;
        }
        try {
            await this.appService.save(app);
            await this.router.navigate(['/apps', app.id]);
        } catch (error) {
            this.snackBar.open(error.toString());
        }
    }

    test(event: any) {
        console.log(event);
    }
}
