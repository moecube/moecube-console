import {Component, OnInit, ViewChild} from '@angular/core';
import App, {I18n} from '../models/browserapp';
import {AppService} from './app.service';
import {ActivatedRoute, Params} from '@angular/router';
import 'rxjs/Rx';
import {MdTab, MdSnackBar} from '@angular/material';

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
    locale: string;

    constructor(private appService: AppService, private route: ActivatedRoute,
                private snackBar: MdSnackBar) {
    }

    async addTranslate(locale: string) {
        this.locales.push(locale);
        this.locale = this.untranslated_locales()[0];
    }

    async submit() {
        // TODO: 处理上传的数据
        try {
            await this.appService.update(this.app);
            this.snackBar.open('编辑成功', undefined, {duration: 2000});
        } catch (e) {
            this.snackBar.open(e.toString(), undefined, {duration: 2000});
        }
    }

    async ngOnInit() {
        this.route.parent.params
            .switchMap((params: Params) => this.appService.find(params['id']))
            .subscribe(app => {
                this.app = app;
                this.locales = Object.keys(app.name);
                this.locale = this.untranslated_locales()[0];
                for (let [locale, news] of Object.entries(app.news)) {
                    this.news[locale] = JSON.stringify(news);
                }
            });
    }

    untranslated_locales() {
        return ['zh-CN', 'zh-TW', 'en-US', 'ja-JP'].filter(locale => !this.locales.includes(locale));
    }
}
