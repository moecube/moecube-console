/**
 * Created by weijian on 2016/12/30.
 */
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AppsComponent} from './apps.component';


const routes: Routes = [
    { path: '', redirectTo: '/apps/1', pathMatch: 'full' },
    { path: 'apps/:id',  component: AppsComponent},
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class RoutingModule {}


/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */
