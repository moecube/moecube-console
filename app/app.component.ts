import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {AppService} from './app.service';
import App from '../models/browserapp';
@Component({
    moduleId: module.id,
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {
    app: App;

    constructor(private route: ActivatedRoute, private appService: AppService) {
    }

    ngOnInit() {
        this.route.params
            .switchMap((params: Params) => this.appService.find(params['id']))
            .subscribe(app => {
                this.app = app;
            });
    }

    change_icon(app: App, file: File) {
        if (!file) {
            return;
        }
        console.log(app, file);
    }

    remove() {

    }

    unpublish() {

    }

}
