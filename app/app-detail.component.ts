import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import App from '../models/browserapp';
import {AppService} from './app.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import 'rxjs/Rx';
import {MdIconRegistry, MdSnackBar} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    moduleId: module.id,
    templateUrl: 'app-detail.component.html',
    styleUrls: ['app-detail.component.css']
})
export class AppDetailComponent implements OnInit {
    app: App;

    constructor(private appService: AppService, private route: ActivatedRoute,
                private snackBar: MdSnackBar) {
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
        let id = this.route.parent.snapshot.params['id'];
        this.app = await this.appService.find(id);
    }
}
