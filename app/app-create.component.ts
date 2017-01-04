/**
 * Created by weijian on 2016/12/30.
 */
import {Component} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import App from '../models/browserapp';
@Component({
    moduleId: module.id,
    templateUrl: 'app-create.component.html',
    styleUrls: ['app-create.component.css'],
})
export class AppCreateComponent {
    locales = ['zh-CN', 'zh-TW', 'en-US', 'ja-JP'];

    locale = 'zh-CN';
    id: string;
    name: string;
    app = {name: {}};

    constructor(public dialogRef: MdDialogRef<AppCreateComponent>) {
    }

    submit(id: string, locale: string, name: string) {
        this.dialogRef.close(new App({id: id, name: {[locale]: name}}));
    }
}
