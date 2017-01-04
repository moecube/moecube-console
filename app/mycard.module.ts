import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import 'hammerjs';
import {AppsComponent}  from './apps.component';
import {MaterialModule, MdIconRegistry} from '@angular/material';
import {MyCardComponent} from './mycard.component';
import {RoutingModule} from './routing.module';
import {FormsModule} from '@angular/forms';
import {AppService} from './app.service';
import {HttpModule} from '@angular/http';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import {AppDetailComponent} from './app-detail.component';
import {AppComponent} from './app.component';
import {AppLocalesComponent} from './app-locales.component';
import {AppPackagesComponent} from './app-packages.component';
import {AppCreateComponent} from './app-create.component';


@NgModule({
    imports: [
        BrowserModule, MaterialModule.forRoot(), FormsModule, RoutingModule, HttpModule,
    ],
    declarations: [AppsComponent, MyCardComponent, AppComponent, AppDetailComponent, AppLocalesComponent, AppPackagesComponent,
        AppCreateComponent],
    bootstrap: [MyCardComponent],
    entryComponents: [AppCreateComponent],
    providers: [AppService, MdIconRegistry],
})
export class AppModule {
    constructor(mdIconRegistry: MdIconRegistry) {
        mdIconRegistry.registerFontClassAlias('fa', 'fontawesome');
        mdIconRegistry.registerFontClassAlias('fontawesome', 'fa');
    }
}
