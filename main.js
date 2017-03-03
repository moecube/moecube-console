#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const child_process = require("child_process");
const Mustache = require("mustache");
require("promised-node");
// const vercomp = require('vercomp');
let database;
try {
    database = require('/data/apps/data.json');
}
catch (error) {
    database = {};
}
const release_path = '/data/release';
function readdirRecursive(_path) {
    return __awaiter(this, void 0, void 0, function* () {
        let files = yield fs.readdirAsync(_path);
        let result = files;
        for (let file of files) {
            let child = path.join(_path, file);
            let stat = yield fs.statAsync(child);
            if (stat.isDirectory()) {
                result = result.concat((yield readdirRecursive(child)).map((_file) => path.join(file, _file)));
            }
        }
        return result;
    });
}
function caculateSHA256(file) {
    return new Promise((resolve, reject) => {
        let input = fs.createReadStream(file);
        const hash = crypto.createHash("sha256");
        hash.on("error", (error) => {
            reject(error);
        });
        input.on("error", (error) => {
            reject(error);
        });
        hash.on('readable', () => {
            let data = hash.read();
            if (data) {
                resolve(data.toString("hex"));
            }
        });
        input.pipe(hash);
    });
}
function archive(archive, files, directory) {
    return new Promise((resolve, reject) => {
        let child = child_process.spawn("tar", ["-zcvf", archive, '-C', directory].concat(files), { stdio: 'inherit' });
        child.on('exit', (code) => {
            if (code == 0) {
                resolve();
            }
            else {
                reject(code);
            }
        });
        child.on('error', (error) => {
            reject(error);
        });
    });
}
function nothing() {
}
function main(package_id, version) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`package ${package_id} version ${version}`);
        yield fs.mkdirAsync(release_path).catch(nothing);
        yield fs.mkdirAsync(path.join(release_path, "downloads")).catch(nothing);
        yield fs.mkdirAsync(path.join(release_path, "metalinks")).catch(nothing);
        yield fs.mkdirAsync(path.join(release_path, "checksums")).catch(nothing);
        yield fs.mkdirAsync(path.join(release_path, "dist")).catch(nothing);
        yield fs.unlinkAsync(path.join(release_path, "downloads", `${package_id}.tar.gz`)).catch(nothing);
        const template = yield fs.readFileAsync("template.meta4", { encoding: 'utf8' });
        // 列目录
        let package_path = path.join('/data/apps', package_id);
        let files = yield readdirRecursive(package_path);
        files.unshift('.');
        // 计算checksum
        let checksums = new Map();
        for (let file of files) {
            let stat = yield fs.statAsync(path.join(package_path, file));
            if (stat.isDirectory()) {
                checksums.set(file, '');
            }
            else {
                checksums.set(file, yield caculateSHA256(path.join(package_path, file)));
            }
        }
        // 生成checksum文件
        let checksum = Array.from(checksums).map(([file, checksum]) => `${checksum}  ${file}`).join("\n");
        fs.writeFileAsync(path.join(release_path, "checksums", package_id), checksum);
        // 打整包
        yield fs.mkdirAsync(path.join(release_path, "downloads", package_id)).catch(nothing);
        yield fs.mkdirAsync(path.join(release_path, "downloads", package_id, 'full')).catch(nothing);
        let archive_file = path.join(release_path, 'downloads', package_id, 'full', `${package_id}.tar.gz`);
        yield fs.unlinkAsync(archive_file).catch(nothing);
        yield archive(archive_file, yield fs.readdirAsync(package_path), package_path);
        let archive_checksum = yield caculateSHA256(archive_file);
        let checksum_file = path.join(release_path, 'downloads', package_id, 'full', `${package_id}.checksum.txt`);
        yield fs.writeFileAsync(checksum_file, archive_checksum);
        let size_file = path.join(release_path, 'downloads', package_id, 'full', `${package_id}.size.txt`);
        yield fs.writeFileAsync(size_file, (yield fs.statAsync(archive_file)).size.toString());
        let link_file = path.join(release_path, 'dist', `${archive_checksum}.tar.gz`);
        yield fs.unlinkAsync(link_file).catch(nothing);
        yield fs.symlinkAsync(archive_file, link_file);
        // 整包的meta4
        let metalink = Mustache.render(template, {
            name: `${package_id}.tar.gz`,
            size: (yield fs.statAsync(archive_file)).size,
            hash: archive_checksum
        });
        yield fs.writeFileAsync(path.join(release_path, "metalinks", `${package_id}.meta4`), metalink);
        // TODO: 打近期包
        // 打散包
        yield fs.mkdirAsync(path.join(release_path, "downloads", package_id, 'sand')).catch(nothing);
        let sand_path = path.join(release_path, 'downloads', package_id, 'sand');
        // TODO: 保留跟上一个版本相比没改动过的散包文件，无需重复打包
        for (let file of yield readdirRecursive(sand_path)) {
            yield fs.unlinkAsync(file).catch(nothing);
        }
        for (let file of files) {
            let stat = yield fs.statAsync(path.join(package_path, file));
            if (!stat.isDirectory()) {
                let archive_file = path.join(release_path, 'downloads', package_id, 'sand', `${file.replace(/\//g, '__')}.tar.gz`);
                yield archive(archive_file, [file], package_path);
                let checksum_file = path.join(release_path, 'downloads', package_id, 'sand', `${file.replace(/\//g, '__')}.checksum.txt`);
                let checksum = yield caculateSHA256(archive_file);
                yield fs.writeFileAsync(checksum_file, checksum);
                let size_file = path.join(release_path, 'downloads', package_id, 'sand', `${file.replace(/\//g, '__')}.size.txt`);
                yield fs.writeFileAsync(size_file, (yield fs.statAsync(archive_file)).size.toString());
                let link_file = path.join(release_path, 'dist', `${checksum}.tar.gz`);
                yield fs.unlinkAsync(link_file).catch(nothing);
                yield fs.symlinkAsync(archive_file, link_file);
            }
        }
        // TODO: 分发
    });
}
if (process.argv[2] && process.argv[3]) {
    main(process.argv[2], process.argv[3]);
}
else {
    console.log(`param: <package> <version>`);
}
//# sourceMappingURL=main.js.map