import {Component, OnInit} from '@angular/core';
import App from '../models/browserapp';
import {AppService} from './app.service';
import {ActivatedRoute, Params} from '@angular/router';
import 'rxjs/Rx';
import {Package} from '../models/package';

@Component({
    moduleId: module.id,
    templateUrl: 'app-packages.component.html',
    styleUrls: ['app-packages.component.css']
})
export class AppPackagesComponent implements OnInit {
    app: App;

    packages: Package[];

    constructor(private appService: AppService, private route: ActivatedRoute) {
    }

    async ngOnInit() {
        this.route.parent.params
            .switchMap((params: Params) => this.appService.find(params['id']))
            .subscribe(async(app) => {
                this.app = app;
                this.packages = await this.appService.allPackages(app.id);
            });
    }

    package_description(_package: any) {
        // _package.platform
    }
}
