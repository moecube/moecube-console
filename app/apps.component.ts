import {Component, OnInit} from '@angular/core';
import {AppService} from './app.service';
import {App} from '../models/app';

@Component({
    selector: 'apps',
    moduleId: module.id,
    templateUrl: 'apps.component.html',
    styleUrls: ['apps.component.css']
})
export class AppsComponent implements OnInit {
    apps: App[];

    constructor(private appService: AppService) {
    }

    async ngOnInit() {
        console.log(await this.getApps());
    }

    async getApps() {
        this.apps = await this.appService.getApps();
    }
}

