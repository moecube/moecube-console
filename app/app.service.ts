import {Injectable} from '@angular/core';
import App from '../models/browserapp';
import {Http, RequestOptions, Headers, Response} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Observable} from 'rxjs/Rx';
/**
 * Created by weijian on 2016/12/30.
 */
@Injectable()
export class AppService {
    constructor(private http: Http) {

    }

    getApps(): Promise<App[]> {
        return this.http.get('http://localhost:8000/apps').map((response) => response.json().map((app: any) => new App(app))).toPromise();
    }

    getApp(id: string): Promise<App> {
        return this.http.get(`http://localhost:8000/apps/${id}`).map((response) => new App(response.json())).toPromise();
    }

    handleError(error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let err: Error;
        if (error instanceof Response) {
            err = error.json() || {};
        } else {
            err = new Error('Unknown Error');
        }
        return Observable.throw(err);
    }

    save(app: App): Promise<any> {
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        return this.http.post(`http://localhost:8000/apps/${app.id}`, app, options)
            .map((response) => response.json())
            .catch(this.handleError)
            .toPromise();
    }

    update(app: App) {

    }

}
