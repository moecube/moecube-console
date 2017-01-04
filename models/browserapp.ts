/**
 * Created by zh99998 on 2017/1/4.
 */
interface I18n<T> {
    [locale: string]: T;
}
class App {
    id: string;
    name: I18n<string>;
    parent?: string;
    locales: string[];
    news: I18n<{title: string, url: string, image: string}[]>;
    conference?: string;
    data: any;
}

export class BrowserApp {
    id: string;
    name: I18n<string>;
    parent?: string;
    locales: string[];
    news: I18n<{title: string, url: string, image: string}[]>;
    conference?: string;
    data: any;
}

export default App;
