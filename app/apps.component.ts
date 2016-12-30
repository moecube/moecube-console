import {Component, OnInit} from '@angular/core';
import App from '../models/app';
import {AppService} from './app.service';

@Component({
    selector: 'app',
    moduleId: module.id,
    templateUrl: 'apps.component.html',
    styleUrls: ['apps.component.css']
})
export class AppsComponent implements OnInit {
    apps: App[];

    constructor(private appService: AppService) {
        console.log(module);
    }

    async ngOnInit() {
        await this.getApps();
    }

    async getApps() {
        this.apps = await this.appService.getApps();
    }
}

