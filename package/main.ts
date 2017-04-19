import * as _fs from 'fs'
import * as path from 'path'
import * as fs from 'fs-extra-promise'
import {mongodb} from '../src/models/iridium'
import {crawlPath, caculateSHA256, archive, archiveSingle, untar} from "./utils";

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

  let hashes = new Map<string, object>();
  // let hashes = {}

  await crawlPath(package_path, {
    onFile: async (file) => {
      let hash = await caculateSHA256(file)

      hashes.set(file, {
        file: file,
        hash: hash,
        size: (await fs.statAsync(file)).size.toString()
      })

      // hashes[file] = {
      //   file: file,
      //   hash: hash,
      //   size: (await fs.statAsync(file)).size.toString()
      // }
      let sand_file = path.join(sand_path, `${hash}.tar.gz`)

      await archiveSingle(sand_file, [file], package_path)
    },
    onDir: async (files, _path, depth) => {
    },
  })
  // TODO: 上传checksum: hashes

  const full_file = path.join(full_path, `${package_id}.tar.gz`)

  await fs.removeAsync(full_file)
  await archive(full_file, await fs.readdirAsync(package_path), package_path)

  // TODO: 上传meta
  const full_hash = await caculateSHA256(full_file)
  const full_size = (await fs.statAsync(full_file)).size.toString()

  // TODO: 增量包

  return {
    files: Array.from(hashes.values())
  }
}
