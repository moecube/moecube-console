import axios from 'axios';
import config from './config';
import * as uuid from 'uuid';
import { XmlDocument } from 'xmldoc';


let apps = {};
const locales = ['zh-CN', 'zh-TW', 'en-US', 'ja-JP'];
const languagePack = ['zh-CN', 'en-US'];
const platforms = ['win32', 'darwin'];

const ygoproPlatforms = ['linux', 'osx', 'win32'];
const ygoproLocales = ['en-US', 'ja-JP', 'zh-CN'];

let wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const lang = {
  'en-US': {
    'en-US': 'English',
    'zh-CN': 'Simplified Chinese',
    'zh-TW': 'Traditional Chinese',
    'language_pack': 'Language Pack'
  },
  'zh-CN': {
    'en-US': '英文',
    'zh-CN': '简体中文',
    'zh-TW': '繁体中文',
    'language_pack': '语言包'
  }
};

async function createPackage(app) {
  return await axios.post(config.new_package, {
    id: uuid.v1(),
    appId: app.id,
    locales: locales,
    platforms: platforms,
    version: '0.0.1',
  });
}

async function createYgoproPackage(app) {
  return await axios.post(config.new_package, {
    id: uuid.v1(),
    appId: app.id,
    locales: app.locales,
    platforms: app.platforms,
    version: '0.0.1',
  });
}


async function updatePackage(app, pack) {
  let { data } = await axios.get(config.old_metalinks(app.id));
  const xml = new XmlDocument(data);
  const rawUrl = xml.valueWithPath('file.url');
  const url = rawUrl.replace('https://r.my-card.in/dist/', 'https://r.my-card.in/release/dist/');

  console.log(pack._id, url);
  return await axios.post(config.upload_url, {
    _id: pack._id,
    url
  });
}


async function updateYogoproPackage(app, pack) {
  let metalink = `${app.id}-${pack.platforms[0]}-${pack.locales[0]}`.replace('osx', 'darwin');
  let { data } = await axios.get(config.old_metalinks(metalink));
  const xml = new XmlDocument(data);
  const rawUrl = xml.valueWithPath('file.url');
  const url = rawUrl.replace('https://r.my-card.in/dist/', 'https://r.my-card.in/release/dist/');

  console.log(pack._id, url);
  return await axios.post(config.upload_url, {
    _id: pack._id,
    url
  });
}

async function handleYgopro(app) {
  console.log(ygoproPlatforms, ygoproLocales);
  for (let platform of ygoproPlatforms) {
    for (let locale of ygoproLocales) {
      try {
        app.platforms = [platform];
        app.locales = [locale];
        console.log('正在处理yogopro', app.platforms, app.locales);
         let { data } = await createYgoproPackage(app);
        await updateYogoproPackage(app, data);
        await wait(180000);
      } catch (e) {
        console.log(e.response.data);
      }
    }
  }
}

async function createApp(app) {
  return await axios.post(config.new_app(app.id), {
    id: app.id,
    name: app.name,
    author: '1',
  });
}

function handleName(app) {
  if (!app.parent) {
    console.log('parent 不存在', app.parent);
  }
  return Object.assign({}, ...languagePack.map(language => ({
    /* tslint:disable */
    [language]: `${apps[app.parent]['name'][language]} ${lang[language]['language_pack']} (${app.locales.map(locale => lang[language][locale])})`
    /* tslint:enable */
  })));
}

async function updateApp(app) {
  const {
    id, name, description, developers, publishers, released_at, category, tags, dependencies, references,
    homepage, actions, version, conference, icon, cover, background, locales, author, news, ...other
  } = app;
  return await
    axios.patch(config.new_app(app.id), {
      id,
      name: name || handleName(app),
      description,
      developers,
      publishers,
      released_at,
      category,
      tags,
      dependencies,
      references,
      homepage,
      actions,
      version,
      conference,
      icon,
      cover,
      background,
      locales: locales || [],
      news: {},
      ...other,
    });
}


async function main() {

  let { data } = await axios.get(config.old_apps_json);
  let newApps = await axios.get(config.new_apps_json);

  newApps.data.map(app => {
    apps[app['id']] = app;
  });

  for (let app of data) {
    if (!['desmume', 'test'].includes(app['id']) && !apps[app['id']]) {
      await createApp(app);
    }
  }

  for (let i = 0, t = 0, w = true; i <= data.length; i++ , t = 180000) {

    try {
      let app = data[i];
      // if (w) {
      //   await wait(t);
      //   w = true;
      // }

      // if (!['ygopro', 'desmume', 'test'].includes(app['id'])) {
      //   console.log(`正在处理${app['id']}`);

      //   await updateApp(app);

      //   let { data } = await createPackage(app);

      //   await updatePackage(app, data);
      // }
      if (app['id'] == 'ygopro') {
        await updateApp(app);

        handleYgopro(app);
      }
    } catch (e) {
      console.log(e.response.data);
      w = false;
      continue;
    }
  }
}

main();


