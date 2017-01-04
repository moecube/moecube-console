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

    // TODO: 实现进 Model 里
    constructor(o: any) {
        for (let [key, value] of Object.entries(o)) {
            this[key] = value;
        }
    }
}

export default App;
