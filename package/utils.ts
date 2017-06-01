import * as fs from 'fs-extra-promise';
import * as _fs from 'fs';
import * as crypto from 'crypto';
import * as child_process from 'child_process';

interface CrawOptions {
  onDir: (files: string | string[], _path: string, depth: number) => Promise<void>;
  onFile: (file: string) => Promise<void>;
}

export async function crawlPath(_path, options: CrawOptions, depth = 0) {
  if (await isDir(_path)) {
    depth += 1;
    const files = await fs.readdirAsync(_path);
    await options.onDir(files, _path, depth);

    if (files) {
      for (let fileName of files) {
        const file = `${_path}/${fileName}`;

        if (await isDir(file)) {
          await crawlPath(file, options, depth);
        } else if (await isFile(file)) {
          await options.onFile(file);
        }
      }
    }
  } else if (await isFile(_path)) {
    await options.onFile(_path);
  }
}

export async function isDir(path) {
  return (await fs.lstatAsync(path)).isDirectory();
}

export async function isFile(path) {
  return (await fs.lstatAsync(path)).isFile();
}


export function archiveSingle(archive: string, files: string[], directory: string): Promise<void> {
  // const dir = fs.createWriteStream(archive)
  // const pack = tar.Pack()
  //   .on('error', () => console.log('error'))
  //   .on('end',() => {})
  // fstream.Reader({type: 'File', path: file})
  //   .pipe(pack)
  //   .pipe(dir)
  // return tar.pack(file).pipe(_fs.createWriteStream(archive))
  return new Promise<void>((resolve, reject) => {
    let child = child_process.spawn('tar', ['-czf', archive, '-P', '-C', directory].concat(files), {stdio: 'inherit'});
    child.on('exit', (code) => {
      if (code == 0) {
        resolve();
      } else {
        reject(code);
      }
    });
    child.on('error', (error) => {
      reject(error);
    });
  });
}

export function archive(archive: string, files: string[], directory: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let child = child_process.spawn('tar', ['-czf', archive, '-C', directory].concat(files), {stdio: 'inherit'});
    child.on('exit', (code) => {
      if (code == 0) {
        resolve();
      } else {
        reject(code);
      }
    });
    child.on('error', (error) => {
      reject(error);
    });
  });
}

export function untar(archive: string, directory: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let child = child_process.spawn('tar', ['-xf', archive, '-C', directory], {stdio: 'inherit'});
    child.on('exit', (code) => {
      if (code == 0) {
        resolve();
      } else {
        reject(code);
      }
    });
    child.on('error', (error) => {
      reject(error);
    });
  });
}

export function caculateSHA256(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let input = _fs.createReadStream(file);
    const hash = crypto.createHash('sha256');
    hash.on('error', (error: Error) => {
      reject(error);
    });
    input.on('error', (error: Error) => {
      reject(error);
    });
    hash.on('readable', () => {
      let data = hash.read();
      if (data) {
        resolve((<Buffer>data).toString('hex'));
      }
    });
    input.pipe(hash);
  });
}
