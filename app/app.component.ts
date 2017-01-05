import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AppService} from './app.service';
import App from '../models/browserapp';
import {MdSnackBar} from '@angular/material';
@Component({
    moduleId: module.id,
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {
    app: App;

    constructor(private route: ActivatedRoute, private appService: AppService,
                private snackBar: MdSnackBar, private router: Router) {
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

    async remove() {
        if (confirm('确认删除')) {
            try {
                await this.appService.remove(this.app);
                await this.router.navigate(['/apps']);
                this.snackBar.open('删除成功', undefined, {duration: 2000});
            } catch (e) {
                this.snackBar.open(e.toString(), undefined, {duration: 2000});
            }
        }
    }

    unpublish() {

    }

}
