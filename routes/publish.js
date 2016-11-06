"use strict";

const router = require('koa-router')();

const EventEmitter = require('events');
const Aria2 = require('aria2');

const latest = require('../models/latest');

const download_path = '/downloads';

const aria2 = new Aria2();
aria2.open();
const eventemitter = new EventEmitter();
aria2.onDownloadComplete = (event) => {
    eventemitter.emit(event.gid);
};
aria2.onDownloadError = (event) => {
    eventemitter.emit(event.gid, 'error');
};

router.post('/publish', async(ctx)=> {
    let version = ctx.query.version;
    let platform = ctx.query.platform;
    let files = [];
    switch (platform) {
        case 'osx':
            platform = 'darwin';
            files.push([`mycard-${version}.dmg`, `MyCard-${version}.dmg`]);
            files.push([`mycard-${version}-mac.zip`, `MyCard-${version}-mac.zip`]);
            break;
        case 'linux':
            files.push([`mycard-${version}-x86_64.AppImage`, `mycard-${version}-x86_64.AppImage`]);
            break;
        case 'win32':
            files.push([`mycard-Setup-${version}.exe`, `MyCard Setup ${version}.exe`]);
            break;
        default:
            let error = new Error(`unknown platform: ${platform}`);
            error.expose = true;
            error.status = 400;
            throw error;
    }
    await Promise.all(files.map(async([artifact, file])=> {
        let gid = await aria2.addUri([`https://github.com/mycard/mycard/releases/download/${version}/${artifact}`], {
            dir: download_path,
            out: file
        });
        console.log('start download', file);
        return new Promise((resolve, reject)=> {
            eventemitter.once(gid, (error)=> {
                if (error) {
                    let error = new Error(`can't download artifact: ${artifact}`);
                    error.expose = true;
                    error.status = 400;
                    reject(error);
                } else {
                    resolve()
                }
            })
        })
    }));
    console.log('download finish');

    await latest.refresh(platform, version);
    ctx.response.status = 204;
});


module.exports = router;