import * as _fs from 'fs'
import * as path from 'path'
import * as fs from 'fs-extra-promise'
import {mongodb} from '../src/models/iridium'
import {crawlPath, caculateSHA256, archive, archiveSingle, untar} from "./utils";
import {Archive, File} from "../src/models/Package";

const upload_path = path.join(__dirname, '../test/upload')
const release_path = path.join(__dirname, '../test/release')
const app_path = path.join(__dirname, '../test/apps')


export async function bundle(...args) {
  const [package_id] = args
  console.log(`package ${package_id}`);


  await fs.ensureDirAsync(release_path)
  await fs.ensureDirAsync(app_path)
  await fs.ensureDirAsync(upload_path)

  const archive_path = path.join(release_path, 'downloads', package_id)
  const package_path = path.join(app_path, package_id);
  const uploadFile_path = path.join(upload_path, package_id)
  const full_path = path.join(archive_path, 'full')
  const sand_path = path.join(archive_path, 'sand')
  await fs.ensureDirAsync(archive_path)
  await fs.ensureDirAsync(package_path)
  await fs.ensureDirAsync(full_path)
  await fs.ensureDirAsync(sand_path)

  // untar upload package
  await untar(uploadFile_path, package_path)

  let files = new Map<string, File>();
  let archives = new Map<string, Archive>();
  // let files = {}

  await crawlPath(package_path, {
    onFile: async (file) => {
      let file_hash = await caculateSHA256(file)

      files.set(file, {
        path: file,
        hash: file_hash,
        size: (await fs.statAsync(file)).size.toString()
      })

      let sand_file = path.join(sand_path, `${file_hash}.tar.gz`)

      archives.set(sand_file, {
        path: sand_file,
        hash: await caculateSHA256(sand_file),
        size: (await fs.statAsync(sand_file)).size.toString()
      })

      await archiveSingle(sand_file, [file], package_path)
    },
    onDir: async (files, _path, depth) => {
    },
  })
  // TODO: 上传checksum: files

  const fullFile = path.join(full_path, `${package_id}.tar.gz`)

  await fs.removeAsync(fullFile)
  await archive(fullFile, await fs.readdirAsync(package_path), package_path)

  // TODO: 上传meta
  const fullHash = await caculateSHA256(fullFile)
  const fullSize = (await fs.statAsync(fullFile)).size.toString()

  // TODO: 增量包

  return {
    files: Array.from(files.values()),
    archives: Array.from(archives.values()),
    fullFile,
    fullSize,
    fullHash
  }
}
