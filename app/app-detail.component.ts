import {Component, OnInit} from '@angular/core';
import App from '../models/browserapp';
import {AppService} from './app.service';
import {ActivatedRoute, Params} from '@angular/router';
import 'rxjs/Rx';
import {MdIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    moduleId: module.id,
    templateUrl: 'app-detail.component.html',
    styleUrls: ['app-detail.component.css']
})
export class AppDetailComponent implements OnInit {
    app: App;

    constructor(private appService: AppService, private route: ActivatedRoute, iconRegistry: MdIconRegistry, sanitizer: DomSanitizer) {
    }

    async ngOnInit() {
        this.route.parent.params
            .switchMap((params: Params) => this.appService.find(params['id']))
            .subscribe(app => {
                this.app = app;
            });
    }
}
