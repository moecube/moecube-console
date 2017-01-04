import {Component, OnInit, Input} from '@angular/core';
import App from '../models/app';
import {AppService} from './app.service';
import {ActivatedRoute} from '@angular/router';
import 'rxjs/Rx';
import {MdIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    moduleId: module.id,
    templateUrl: 'app-detail.component.html',
    styleUrls: ['app-detail.component.css']
})
export class AppDetailComponent implements OnInit {
    @Input()
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
        // this.route.params
        //     .switchMap((params: Params) => this.appService.getApp(params['id']))
        //     .subscribe(app => {
        //         this.app = app;
        //         this.locales = Object.keys(this.app.name);
        //     });
    }
}
