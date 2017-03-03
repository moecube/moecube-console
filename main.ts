#!/usr/bin/env node
/**
 * Created by zh99998 on 2016/12/12.
 */
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as child_process from "child_process";
import * as Mustache from "mustache";
import "promised-node";
// const vercomp = require('vercomp');

let database;
try {
    database = require('/data/apps/data.json');
} catch (error) {
    database = {}
}

const release_path = '/data/release';

async function readdirRecursive(_path: string | Buffer): Promise<string[]> {
    let files = await fs.readdirAsync(_path);
    let result = files;
    for (let file of files) {
        let child = path.join(_path, file);
        let stat = await fs.statAsync(child);
        if (stat.isDirectory()) {
            result = result.concat((await readdirRecursive(child)).map((_file) => path.join(file, _file)))
        }
    }
    return result;
}

function caculateSHA256(file: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let input = fs.createReadStream(file);
        const hash = crypto.createHash("sha256");
        hash.on("error", (error: Error) => {
            reject(error)
        });
        input.on("error", (error: Error) => {
            reject(error);
        });
        hash.on('readable', () => {
            let data = hash.read();
            if (data) {
                resolve((<Buffer>data).toString("hex"));
            }
        });
        input.pipe(hash);
    });
}

function archive(archive: string, files: string[], directory: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let child = child_process.spawn("tar", ["-zcvf", archive, '-C', directory].concat(files), {stdio: 'inherit'});
        child.on('exit', (code) => {
            if (code == 0) {
                resolve()
            } else {
                reject(code);
            }
        });
        child.on('error', (error) => {
            reject(error);
        })
    });
}

function nothing() {
}

async function main(package_id, version) {
    console.log(`package ${package_id} version ${version}`);

    await fs.mkdirAsync(release_path).catch(nothing);
    await fs.mkdirAsync(path.join(release_path, "downloads")).catch(nothing);
    await fs.mkdirAsync(path.join(release_path, "metalinks")).catch(nothing);
    await fs.mkdirAsync(path.join(release_path, "checksums")).catch(nothing);
    await fs.mkdirAsync(path.join(release_path, "dist")).catch(nothing);
    await fs.unlinkAsync(path.join(release_path, "downloads", `${package_id}.tar.gz`)).catch(nothing);
    const template = await fs.readFileAsync("template.meta4", {encoding: 'utf8'});

    // 列目录

    let package_path = path.join('/data/apps', package_id);

    let files = await readdirRecursive(package_path);
    files.unshift('.');

    // 计算checksum
    let checksums = new Map<string, string>();

    for (let file of files) {
        let stat = await fs.statAsync(path.join(package_path, file));
        if (stat.isDirectory()) {
            checksums.set(file, '')
        } else {
            checksums.set(file, await caculateSHA256(path.join(package_path, file)))
        }
    }

    // 生成checksum文件
    let checksum = Array.from(checksums).map(([file, checksum]) => `${checksum}  ${file}`).join("\n");
    fs.writeFileAsync(path.join(release_path, "checksums", package_id), checksum);

    // 打整包
    await fs.mkdirAsync(path.join(release_path, "downloads", package_id)).catch(nothing);
    await fs.mkdirAsync(path.join(release_path, "downloads", package_id, 'full')).catch(nothing);
    let archive_file = path.join(release_path, 'downloads', package_id, 'full', `${package_id}.tar.gz`);

    await fs.unlinkAsync(archive_file).catch(nothing);
    await archive(archive_file, await fs.readdirAsync(package_path), package_path);

    let archive_checksum = await caculateSHA256(archive_file);
    let checksum_file = path.join(release_path, 'downloads', package_id, 'full', `${package_id}.checksum.txt`);
    await fs.writeFileAsync(checksum_file, archive_checksum);
    let size_file = path.join(release_path, 'downloads', package_id, 'full', `${package_id}.size.txt`);
    await fs.writeFileAsync(size_file, (await fs.statAsync(archive_file)).size.toString());

    let link_file = path.join(release_path, 'dist', `${archive_checksum}.tar.gz`);
    await fs.unlinkAsync(link_file).catch(nothing);
    await fs.symlinkAsync(path.relative(path.join(release_path, 'dist'), archive_file), link_file);

    // 整包的meta4
    let metalink = Mustache.render(template, {
        name: `${package_id}.tar.gz`,
        size: (await fs.statAsync(archive_file)).size,
        hash: archive_checksum
    });

    await fs.writeFileAsync(path.join(release_path, "metalinks", `${package_id}.meta4`), metalink);

    // TODO: 打近期包

    // 打散包

    await fs.mkdirAsync(path.join(release_path, "downloads", package_id, 'sand')).catch(nothing);
    let sand_path = path.join(release_path, 'downloads', package_id, 'sand');

    // TODO: 保留跟上一个版本相比没改动过的散包文件，无需重复打包
    for (let file of await readdirRecursive(sand_path)) {
        await fs.unlinkAsync(file).catch(nothing);
    }

    for (let file of files) {
        let stat = await fs.statAsync(path.join(package_path, file));
        if (!stat.isDirectory()) {
            let archive_file = path.join(release_path, 'downloads', package_id, 'sand', `${file.replace(/\//g, '__')}.tar.gz`);
            await archive(archive_file, [file], package_path);
            let checksum_file = path.join(release_path, 'downloads', package_id, 'sand', `${file.replace(/\//g, '__')}.checksum.txt`);
            let checksum = await caculateSHA256(archive_file);
            await fs.writeFileAsync(checksum_file, checksum);
            let size_file = path.join(release_path, 'downloads', package_id, 'sand', `${file.replace(/\//g, '__')}.size.txt`);
            await fs.writeFileAsync(size_file, (await fs.statAsync(archive_file)).size.toString());
            let link_file = path.join(release_path, 'dist', `${checksum}.tar.gz`);
            await fs.unlinkAsync(link_file).catch(nothing);
            await fs.symlinkAsync(path.relative(path.join(release_path, 'dist'), archive_file), link_file);
        }
    }

    // TODO: 分发

}

if (process.argv[2] && process.argv[3]) {
    main(process.argv[2], process.argv[3])
} else {
    console.log(`param: <package> <version>`)
}
