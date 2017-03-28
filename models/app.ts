import 'reflect-metadata';
import * as Mongorito from 'mongorito';
import Model = Mongorito.Model;
import {field} from '../db/decorators';
import {ModelExistsError} from './errors';
import {File} from './package'
/**
 * Created by weijian on 2016/12/28.
 */
interface I18n<T> {
    [locale: string]: T;
}
interface Platform<T> {
    [platform: string]: T;
}
interface Package{
    id: string;
    name: string;
    platforms: Platform<string[]>;
    locales: I18n<string[]>;
    files: File[];
}

export class App extends Model {
    @field
    id: string;
    @field
    name?: I18n<string>;
    @field
    description?: I18n<string>
    @field
    developers?: I18n<[{ name: string, url: string }]>
    @field
    publishers?: I18n<[{ name: string, url: string }]>    
    @field
    released_at?: string;
    @field
    category?: string;
    @field
    parent?: string;
    @field
    tag?:  string[];
    @field
    dependencies?: Platform<string[]>;
    @field
    references?: Platform<string[]>;
    @field
    homepage?: string;
    @field
    locales?: string[];
    @field
    actions?: Platform<{[key: string]: {execuate: string, args: string[], env: {[key: string]: string}}}>;
    @field
    files?: {[key: string]: { sync: boolean}}
    @field
    version?: Platform<string>;
    @field
    news?: I18n<{title: string, url: string, image: string}[]>;
    @field
    conference?: string;
    @field
    data?: any;
    @field
    icon?: string;
    @field
    cover?: string;
    @field
    background?: string;
    @field
    packages?: Package[];

    async checkExists() {
        let app = await App.findOne({id: this.id});
        if (app) {
            throw new ModelExistsError(`App ${this.id} exists`);
        }
    }

    configure() {
        this.before('create', this.checkExists);
    }
}


