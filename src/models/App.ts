import {Collection, Index, Instance, Property} from 'iridium';
import {handleImg} from '../utils';

interface I18n<T> {
  [locale: string]: T;
}

interface Platform<T> {
  [platform: string]: T;
}

interface Package {
  id: string;
  name: string;
  platforms: Platform<string[]>;
  locales: I18n<string[]>;
  files: File[];
}

interface File {
  path: string;
  size: number;
  hash: string;
}


export interface App {
  id: string;
  name?: I18n<string>;
  description?: I18n<string>;
  developers?: I18n<[{ name: string, url: string }]>;
  publishers?: I18n<[{ name: string, url: string }]>;
  released_at?: string;
  category?: string;
  parent?: string;
  tag?: string[];
  dependencies?: Platform<string[]>;
  references?: Platform<string[]>;
  homepage?: string;
  locales?: string[];
  actions?: Platform<{ [key: string]: { execuate: string, args: string[], env: { [key: string]: string } } }>;
  files?: { [key: string]: { sync: boolean } };
  version?: Platform<string>;
  news?: I18n<{ title: string, url: string, image: string }[]>;
  conference?: string;
  data?: any;
  icon?: string;
  cover?: string;
  background?: string;
  // packages?: Package[];
  created_at: Date;
}

@Collection('apps')
@Index({id: 1}, {unique: true})
export class AppSchema extends Instance<App, AppSchema> implements App {
  @Property(String, true)
  id: string;
  @Property(Object, false)
  name?: I18n<string>;
  @Property(Object, false)
  description?: I18n<string>;
  @Property(Object, false)
  developers?: I18n<[{ name: string, url: string }]>;
  @Property(Object, false)
  publishers?: I18n<[{ name: string, url: string }]>;
  @Property(String, false)
  released_at?: string;
  @Property(String, false)
  category?: string;
  @Property(String, false)
  parent?: string;
  @Property(Array, false)
  tag?: string[];
  @Property(Object, false)
  dependencies?: Platform<string[]>;
  @Property(Object, false)
  references?: Platform<string[]>;
  @Property(String, false)
  homepage?: string;
  @Property(Array, false)
  locales?: string[];
  @Property(Object, false)
  actions?: Platform<{ [key: string]: { execuate: string, args: string[], env: { [key: string]: string } } }>;
  @Property(Object, false)
  files?: { [key: string]: { sync: boolean } };
  @Property(Object, false)
  version?: Platform<string>;
  @Property(Object, false)
  news?: I18n<{ title: string, url: string, image: string }[]>;
  @Property(String, false)
  conference?: string;
  @Property(Object, false)
  data?: any;
  @Property(String, false)
  icon?: string;
  @Property(String, false)
  cover?: string;
  @Property(String, false)
  background?: string;
  // @Property(Array, false)
  // packages?: Package[];
  @Property(Date, false)
  created_at: Date;

  static onCreating(app: App) {
    app.created_at = new Date();
  }

  handleUpdate(data: App) {
    Object.assign(this, data);
  }

  toJSON() {
    this.Convert();
    return JSON.parse(this);
  }

  Convert() {
    this.icon = handleImg(this.icon),
      this.cover = handleImg(this.cover),
      this.background = handleImg(this.background);
  }
}

