import * as path from 'path';
import * as fs from 'fs-extra-promise';
import {archive, archiveSingle, caculateSHA256, crawlPath, untar} from './utils';
import {Archive, File} from '../src/models/Package';

const upload_path = path.join(__dirname, '../test/upload');
const release_path = path.join(__dirname, '../test/release');
const app_path = path.join(__dirname, '../test/apps');


export async function bundle(...args) {
  const [package_id] = args;
  console.log(`package ${package_id}`);


  await fs.ensureDirAsync(release_path);
  await fs.ensureDirAsync(app_path);
  await fs.ensureDirAsync(upload_path);

  const archive_path = path.join(release_path, 'downloads', package_id);
  const package_path = path.join(app_path, package_id);
  const uploadFile_path = path.join(upload_path, package_id);
  // const full_path = path.join(archive_path, 'full');
  // const sand_path = path.join(archive_path, 'sand');
  const dist_path = path.join(archive_path, 'dist');
  await fs.ensureDirAsync(archive_path);
  await fs.ensureDirAsync(package_path);
  // await fs.ensureDirAsync(full_path);
  // await fs.ensureDirAsync(sand_path);
  await fs.ensureDirAsync(dist_path);

  // untar upload package
  await untar(uploadFile_path, package_path);

  let files = new Map<string, File>();
  let archives = new Map<string, Archive>();
  // let files = {}


  await crawlPath(package_path, {
    onFile: async (file) => {
      let file_hash = await caculateSHA256(file);

      files.set(file, {
        path: path.relative(package_path, file),
        hash: file_hash,
        size: (await fs.statAsync(file)).size
      });

      let sand_file = path.join(dist_path, `${file_hash}.tar.gz`);

      await archiveSingle(sand_file, [file], package_path);

      let sand_hash = await caculateSHA256(sand_file);

      archives.set(sand_file, {
        path: path.relative(dist_path, sand_file),
        hash: sand_hash,
        size: (await fs.statAsync(sand_file)).size
      });

      await fs.renameAsync(sand_file, path.join(path.dirname(sand_file), `${sand_hash}.tar.gz`));
    },
    onDir: async (_files, _path, depth) => {
      files.set(_path, {
        path: path.relative(package_path, _path) || '.',
      });
    },
  });

  let filePath = path.join(dist_path, `${package_id}.tar.gz`);

  await archive(filePath, await fs.readdirAsync(package_path), package_path);

  const fullHash = await caculateSHA256(filePath);
  const fullSize = (await fs.statAsync(filePath)).size;

  let fullPath = path.join(path.dirname(filePath), `${fullHash}.tar.gz`);
  await fs.renameAsync(filePath, fullPath);

  await fs.removeAsync(filePath);
  await fs.removeAsync(uploadFile_path)
  await fs.removeAsync(package_path)

  return {
    distPath: dist_path,
    files: Array.from(files.values()),
    archives: Array.from(archives.values()),
    fullSize,
    fullHash
  };
}
