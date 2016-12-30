import {Component, OnInit} from '@angular/core';
import App from '../models/app';
import {AppService} from './app.service';
import {ActivatedRoute, Params} from '@angular/router';
import 'rxjs/Rx';

@Component({
    selector: 'app-detail',
    moduleId: module.id,
    templateUrl: 'app-detail.component.html',
    styleUrls: ['app-detail.component.css']
})
export class AppDetailComponent implements OnInit {
    app: App;

    constructor(private appService: AppService, private route: ActivatedRoute) {
    }

    async ngOnInit() {
        this.route.params
            .switchMap((params: Params) => this.appService.getApp(params['id']))
            .subscribe(app => this.app = app);
    }

}
