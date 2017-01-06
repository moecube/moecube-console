/**
 * Created by weijian on 2016/12/29.
 */

import Router = require('koa-router');
import {NotFound} from '../koa/errors';
import {Package} from '../models/package';
import * as tmp from 'tmp';
import {ChildProcess} from 'child_process';
import fs = require('fs');
import http = require('http');
import isZip = require('is-zip');
import path = require('path');
import child_process = require('child_process');

const router = new Router();

interface Option {
    dir?: string;
}

class Archive {
    constructor(public tarPath = 'tar', public unzipPath = 'unzip') {
    }

    async extract(options?: Option) {
    }

    private async isZip(file: string): Promise<boolean > {
        return new Promise<boolean>((resolve, reject) => {
            fs.readFile(file, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(isZip(data));
                }
            });
        });
    }

    async decompress(file: string, option?: Option) {
        let dir = '.';
        if (option) {
            if (option.dir) {
                dir = option.dir;
            }
        }
        await new Promise(async(resolve, reject) => {
            let process: ChildProcess;
            if (await this.isZip(file)) {

                // TODO zip解压
                process = child_process.spawn(this.unzipPath);
            } else {
                process = child_process.spawn(this.tarPath, ['xvf', file, '-c', dir]);
            }
            process.on('exit', (code, signal) => {
                if (code !== 0) {
                    reject(`tar exited by accident, code ${code}`);
                } else {
                    resolve();
                }
            });
        });
    }
}

router.get('/packages/all/:appId', async(ctx, next) => {
    let appId = ctx.params.appId;
    ctx.body = await Package.findAllByApp(appId);
});
router.get('/packages/:id', async(ctx, next) => {
    let p: Package|null = await Package.findOne({id: ctx.params.id});
    if (!p) {
        throw new NotFound(`Package id ${ctx.params.id} not found`);
    }
    ctx.body = p;
});
router.post('/packages/:id', async(ctx, next) => {
    new Promise<string|Buffer>((resolve, reject) => {
        let downloadUrl = ctx.request.body.downloadUrl;
        tmp.tmpName((e, file) => {
            if (e) {
                reject(e);
            } else {
                let writeStream = fs.createWriteStream(file);
                http.get(downloadUrl, (response) => {
                    response.pipe(writeStream);
                    writeStream.on('finish', () => {
                        resolve(writeStream.path);
                    });
                }).on('error', (err) => {
                    reject(err);
                });
            }
        });
    });

    // TODO 打包
});
export default router;
