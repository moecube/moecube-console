import {Component, OnInit} from '@angular/core';
import App from '../models/app';
import {AppService} from './app.service';
import {ActivatedRoute, Params} from '@angular/router';
import 'rxjs/Rx';
import {MdIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    selector: 'app-detail',
    moduleId: module.id,
    templateUrl: 'app-detail.component.html',
    styleUrls: ['app-detail.component.css']
})
export class AppDetailComponent implements OnInit {
    app: App;

    constructor(private appService: AppService, private route: ActivatedRoute, iconRegistry: MdIconRegistry, sanitizer: DomSanitizer) {
        // iconRegistry.registerFontClassAlias('fontawesome', 'fa');
        // iconRegistry
        //     .addSvgIconSetInNamespace('thumbs-up', 'fonts/core-icon-set.svg')
        // iconRegistry.addSvgIcon(
        //     'thumbs-up',
        //     sanitizer.bypassSecurityTrustResourceUrl('assets/img/examples/thumbup-icon.svg')
        // );
    }

    async ngOnInit() {
        this.route.params
            .switchMap((params: Params) => this.appService.getApp(params['id']))
            .subscribe(app => this.app = app);
    }

}
