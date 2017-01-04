/**
 * Created by weijian on 2016/12/30.
 */
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AppsComponent} from './apps.component';
import {AppDetailComponent} from './app-detail.component';
import {AppComponent} from './app.component';
import {AppLocalesComponent} from './app-locales.component';
import {AppPackagesComponent} from './app-packages.component';


const routes: Routes = [
    {path: '', redirectTo: '/apps', pathMatch: 'full'},
    {path: 'apps', component: AppsComponent},
    {
        path: 'apps/:id',
        component: AppComponent,
        children: [
            {path: 'detail', component: AppDetailComponent},
            {path: 'locales', component: AppLocalesComponent},
            {path: 'packages', component: AppPackagesComponent}
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class RoutingModule {
}


/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */
