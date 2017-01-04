import {Component, OnInit} from '@angular/core';
import App from '../models/app';
import {AppService} from './app.service';
import {MdDialog} from '@angular/material';
import {AppCreateComponent} from './app-create.component';

@Component({
    selector: 'apps',
    moduleId: module.id,
    templateUrl: 'apps.component.html',
    styleUrls: ['apps.component.css']
})
export class AppsComponent implements OnInit {
    apps: App[];

    constructor(private appService: AppService, private dialog: MdDialog) {
    }

    async ngOnInit() {
        console.log(await this.getApps());
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
        console.log(app);
    }
}
