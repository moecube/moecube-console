"use strict";

const fs = require('fs');
const path = require("path");
const crypto = require('crypto');

const download_path = '/downloads';

Array.prototype.max = function () {
    return this.sort()[this.length - 1];
}

exports.refresh = async function (platform, version) {
    let files = await new Promise((resolve, reject)=> {
        fs.readdir(download_path, (error, files)=> {
            if (error) {
                reject(error);
            } else {
                resolve(files);
            }
        })
    });
    switch (platform) {
        case 'darwin':
            this.darwin = files.filter(file=>path.extname(file) == '.dmg').max();
            this.darwin_update = files.filter(file=>path.extname(file) == '.zip').max();

            if (!this.darwin_update) {
                return;
            }
            this.darwin_version = this.darwin_update.match(/MyCard-(.+)-mac\.zip/)[1];
            break;
        case 'linux':
            this.linux = files.filter(file=>path.extname(file) == '.AppImage').max();
            break;
        case 'win32':
            this.win32 = files.filter(file=>path.extname(file) == '.exe').max();
            if (!this.win32) {
                return;
            }
            return new Promise((resolve, reject)=> {
                let hash = crypto.createHash('sha256');
                hash.setEncoding('hex');
                fs.createReadStream(path.join(download_path, this.win32)).pipe(hash);
                hash.on('finish', ()=> {
                    let obj = {
                        version: version,
                        path: this.win32,
                        sha2: hash.read()
                    };
                    let data = Object.entries(obj).map(([key, value])=>`${key}: ${value}`).join("\n");
                    fs.writeFile(path.join(download_path, 'latest.yml'), data, (error)=> {
                        if (error) {
                            reject(error)
                        } else {
                            resolve();
                        }
                    });
                });
                hash.on('error', reject);
            });
            break;
        default:
            return Promise.all([this.refresh('darwin'), this.refresh('linux'), this.refresh('win32')]);
    }
};
