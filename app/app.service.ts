import {Injectable} from '@angular/core';
import App from '../models/browserapp';
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
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
}
