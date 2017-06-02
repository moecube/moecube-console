/**
 * Created by zh99998 on 2017/4/27.
 */
import * as fetch from 'isomorphic-fetch';
import * as _ from 'lodash';
import { XmlDocument } from 'xmldoc';
import config from './config';


async function test_checksums() {
  const apps: any[] = (await (await fetch(config.new_apps_json)).json())
    // .filter(i => !['ygopro', 'desmume'].includes(i.id)); // 排除 ygopro 和 desmume

  let oldMaps = new Set();

  for (let app of apps) {
    console.log(`正在测试 ${app.id} 的 checksum`);
    const old_checksum = await (await fetch(config.old_checksums(app.id))).text();
    const new_checksum = await (await fetch(config.new_checksums(app.id))).text();

    new_checksum.split('\n').forEach(line => {
      oldMaps.add(line);
    });

    old_checksum.split('\n').forEach(line => {
      if (!oldMaps.has(line)) {
        console.log('旧', old_checksum);
        console.log('新', new_checksum);
        throw `应用 ${app.id} 的 checksum 不一致`;
      }
    });
  }
}
async function test_download() {
  const apps: any[] = (await (await fetch(config.new_apps_json)).json())
    .filter(i => !['ygopro', 'desmume'].includes(i.id)); // 排除 ygopro 和 desmume

  const app: any = _.sample(apps);
  console.log(`正在测试 ${app.id} 的 下载`);


  const metalink = await (await fetch(config.new_metalinks(app.id))).text();
  const xml = new XmlDocument(metalink);
  const url = xml.valueWithPath('file.url');


  const response = await fetch(url, { method: 'HEAD' });
  if (!response.ok) {
    throw `${app.id} 的 下载地址 ${url} 返回 ${response.statusText}`;
  }
}
async function test_update() {
  // TODO
}

async function test_apps_json() {
  const old_apps = await (await fetch(config.old_apps_json)).json();
  const new_apps = await (await fetch(config.new_apps_json)).json();
  for (let new_app of new_apps) {
    let old_app = old_apps.find(i => i.id == new_app.id);
    delete old_app.author;
    delete new_app.author;
    delete old_app.news;
    delete new_app.news;
    if (!old_app) {
      throw `应用 ${new_app.id} 在旧的列表不存在`;
    }
    for (let [key, value] of Object.entries(old_app)) {
      if (!new_app[key]) {
        throw `应用 ${new_app.id} 的 ${key} 字段在的新的列表中不存在`;
      }
      if (!_.isEqual(new_app[key], value)) {
        console.log('旧', JSON.stringify(value, null, 2));
        console.log('新', JSON.stringify(new_app[key], null, 2));
        throw `应用 ${new_app.id} 的 ${key} 字段跟旧的不同`;
      }
    }
  }
}

async function main() {
  // await test_apps_json();

  try {
    await test_checksums();
    await test_download();
    await test_update();
  } catch (e) {
    console.log(e);
  }

  console.log('ok');
}

main();

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
