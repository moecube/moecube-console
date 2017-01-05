import {Component, OnInit, ViewChild} from '@angular/core';
import App, {I18n} from '../models/browserapp';
import {AppService} from './app.service';
import {ActivatedRoute, Params} from '@angular/router';
import 'rxjs/Rx';
import {MdIconRegistry, MdTab} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    moduleId: module.id,
    templateUrl: 'app-locales.component.html',
    styleUrls: ['app-locales.component.css']
})
export class AppLocalesComponent implements OnInit {
    app: App;
    locales: string[];
    news: I18n<string> = {};
    @ViewChild('translate')
    translate: MdTab;

    constructor(private appService: AppService, private route: ActivatedRoute, iconRegistry: MdIconRegistry, sanitizer: DomSanitizer) {
    }

    async ngOnInit() {
        this.route.parent.params
            .switchMap((params: Params) => this.appService.getApp(params['id']))
            .subscribe(app => {
                this.app = app;
                this.locales = Object.keys(app.name);
                for (let [locale, news] of Object.entries(app.news)) {
                    this.news[locale] = JSON.stringify(news);
                }
            });
    }

    untranslated_locales() {
        return ['zh-CN', 'zh-TW', 'en-US', 'ja-JP'].filter(locale => !this.locales.includes(locale));
    }
}
