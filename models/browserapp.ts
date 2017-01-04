/**
 * Created by zh99998 on 2017/1/4.
 */
export interface I18n<T> {
    [locale: string]: T;
}
class App {
    id: string;
    name: I18n<string>;
    description: I18n<string> = {};
    parent?: string;
    locales: string[] = [];
    news: I18n<{title: string, url: string, image: string}[]> = {};
    conference?: string;
    data: any;
    icon = 'http://www.immersion-3d.com/wp-content/uploads/2015/12/image-placeholder-500x500.jpg';
    created_at: Date;
    status = '已发布';

    // TODO: 实现进 Model 里
    constructor(o: any) {
        for (let [key, value] of Object.entries(o)) {
            this[key] = value;
        }
        this.created_at = new Date(o.created_at);
    }
}

export default App;
