import 'reflect-metadata';
import * as Mongorito from 'mongorito';
import Model = Mongorito.Model;
import {field} from '../db/decorators';
import {ModelExistsError} from './errors';
/**
 * Created by weijian on 2016/12/28.
 */
interface I18n<T> {
    [locale: string]: T;
}
export class App extends Model {
    @field
    id: string;
    @field
    name: I18n<string>;
    @field
    parent?: string;
    @field
    locales: string[];
    @field
    news: I18n<{title: string, url: string, image: string}[]>;
    @field
    conference?: string;
    @field
    data: any;

    async checkExists() {
        let app = await App.findOne({id: this.id});
        if (app) {
            throw new ModelExistsError(this.id);
        }
    }

    configure() {
        this.before('create', this.checkExists);
    }
}


