/**
 * Created by zh99998 on 2017/4/27.
 */
import * as fetch from 'isomorphic-fetch';
import * as _ from 'lodash';
import {XmlDocument} from 'xmldoc';

// 配置
const old_apps_json = 'https://api.moecube.com/apps.json';
const new_apps_json = 'http://114.215.243.95:8001/v2/apps';
const old_metalinks = (package_id) => `https://cdn01.moecube.com/release/metalinks/${package_id}.meta4`;
const new_metalinks = (package_id) => `https://cdn01.moecube.com/release/metalinks/${package_id}.meta4`; // 修改
const old_checksums = (package_id) => `https://cdn01.moecube.com/release/checksums/${package_id}`;
const new_checksums = (package_id) => `https://cdn01.moecube.com/release/checksums/${package_id}`; // 修改


async function test_checksums() {
  const apps: any[] = (await (await fetch(new_apps_json)).json())
    .filter(i => !['ygopro', 'desmume'].includes(i.id)); // 排除 ygopro 和 desmume

  for (let app of _.sampleSize(apps, 5)) {
    console.log(`正在测试 ${app.id} 的 checksum`);
    const old_checksum = await (await fetch(old_checksums(app.id))).text();
    const new_checksum = await (await fetch(new_checksums(app.id))).text();
    if (old_checksum !== new_checksum) {
      console.log('旧', old_checksum);
      console.log('新', new_checksum);
      throw `应用 ${app.id} 的 checksum 不一致`;
    }
  }
}
async function test_download() {
  const apps: any[] = (await (await fetch(new_apps_json)).json())
    .filter(i => !['ygopro', 'desmume'].includes(i.id)); // 排除 ygopro 和 desmume

  const app: any = _.sample(apps);
  console.log(`正在测试 ${app.id} 的 下载`);
  const metalink = await (await fetch(new_metalinks(app.id))).text();
  const xml = new XmlDocument(metalink);
  const url = xml.valueWithPath('file.url');
  const response = await fetch(url, {method: 'HEAD'});
  if (!response.ok) {
    throw `${app.id} 的 下载地址 ${url} 返回 ${response.statusText}`;
  }
}
async function test_update() {
  // TODO
}

async function test_apps_json() {
  const old_apps = await (await fetch(old_apps_json)).json();
  const new_apps = await (await fetch(new_apps_json)).json();
  for (let new_app of new_apps) {
    let old_app = old_apps.find(i => i.id == new_app.id);
    delete old_app.network;
    delete old_app.author;
    delete new_app.author;
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
  await test_apps_json();
  await test_checksums();
  await test_download();
  await test_update();

  console.log('ok');
}

main();

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});
