import {Injectable} from '@angular/core';
import App from '../models/browserapp';
import {Http, RequestOptions, Headers, Response} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Observable} from 'rxjs/Rx';
/**
 * Created by weijian on 2016/12/30.
 */

function addJsonOptions(options?: RequestOptions): RequestOptions {
    if (options) {
        options.headers.append('Content-Type', 'application/json');
    } else {
        let headers = new Headers({'Content-Type': 'application/json'})
        options = new RequestOptions({headers: headers});
    }
    return options;
}

@Injectable()
export class AppService {
    constructor(private http: Http) {

    }

    all(): Promise<App[]> {
        return this.http.get('http://localhost:8000/apps')
            .map((response) => {
                return response.json().map((app: any) => new App(app));
            }).catch(this.handleError)
            .toPromise();
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
        let options = addJsonOptions();
        return this.http.post(`http://localhost:8000/apps/${app.id}`, app, options)
            .map((response) => response.json())
            .catch(this.handleError)
            .toPromise();
    }

    update(app: App) {
        let options = addJsonOptions();
        return this.http.patch(`http://localhost:8000/apps/${app.id}`, app, options)
            .map((response) => new App(response.json()))
            .catch(this.handleError)
            .toPromise();
    }

    remove(app: App) {
        return this.http.delete(`http://localhost:8000/apps/${app.id}`)
            .map((response) => response.json())
            .catch(this.handleError)
            .toPromise();
    }

    find(id: string): Promise<App> {
        return this.http.get(`http://localhost:8000/apps/${id}`)
            .map((response) => new App(response.json()))
            .catch(this.handleError)
            .toPromise();
    }


}
