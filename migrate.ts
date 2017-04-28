import axios from 'axios';
import config from './config';
import * as uuid from 'uuid';
import * as _ from 'lodash';
import {XmlDocument} from 'xmldoc';


let apps = {};
const locales = ['zh-CN', 'zh-TW', 'en-US', 'ja-JP'];
const languagePack = ['zh-CN', 'en-US'];
const platforms = ['win32', 'darwin'];

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

async function updatePackage(app, pack) {
  let {data} = await axios.get(config.old_metalinks(app.id));
  const xml = new XmlDocument(data);
  const rawUrl = xml.valueWithPath('file.url');
  const url = rawUrl.replace('https://r.my-card.in/dist/', 'https://r.my-card.in/release/dist/');

  console.log(pack._id, url);
  return await axios.post(config.upload_url, {
    _id: pack._id,
    url
  });
}

async function createApp(app) {
  return await axios.post(config.new_app(app.id), {
    id: app.id,
    name: app.name,
    author: '1',
  });
}

function handleName(app) {
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
  await
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

  let {data} = await createPackage(app);

  await updatePackage(app, data);

}


async function main() {

  let {data} = await axios.get(config.old_apps_json);
  let newApps = await axios.get(config.new_apps_json);

  newApps.data.map(app => {
    apps[app['id']] = app;
  })

  try {
    for (let app  of data) {
      if (!['ygopro', 'desmume', 'test'].includes(app['id']) && !apps[app['id']]) {
        await createApp(app)
      }
    }

    for (let app  of _.sampleSize(data, 1)) {
      if (['ygopro', 'desmume', 'test'].includes(app['id'])) {
        await updateApp(app);
      }
    }
  } catch (e) {
    console.trace(e);
  }
}

main();


