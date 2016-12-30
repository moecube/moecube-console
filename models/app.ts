import 'reflect-metadata';
import * as Mongorito from 'mongorito';
import Model = Mongorito.Model;
import {field} from '../db/decorators';
/**
 * Created by weijian on 2016/12/28.
 */
interface I18n<T> {
    [locale: string]: T;
}
class App extends Model {
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
}

export default App;
