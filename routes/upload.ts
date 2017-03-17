import * as Router from 'koa-router'
import * as path from 'path'
import * as uuid from 'uuid'
import * as _fs from 'fs'
import { promisifyAll} from 'bluebird'
const fs:any  = promisifyAll(_fs)

const busboy = require('async-busboy')
const mime = require('mime')

const router = new Router();

function uploadImageStream(file){
  return new Promise(async (resolve, reject) => {
    const ext = mime.extension(file.mime)
    if(['png','jpg','jpeg','gif','webp'].indexOf(ext) === -1) {
      return reject(new Error("Unsupported image type"))
    }
    const hash = uuid.v1()
    const uploadDir = 'upload'
    const fileName = `${hash}.${ext}`

    try {
      let access = await fs.accessAsync(uploadDir)
    } catch (error) {
      await fs.mkdirAsync(uploadDir)
    }

    let writeStream = fs.createWriteStream(path.join(uploadDir, fileName))
    file.pipe(writeStream)

    resolve({fileName})
  })
}


router.post('/upload/image', async(ctx, next) => {
  try {
    const {files} = await busboy(ctx.req)
    const res = await Promise.all(files.map(file => {
      return uploadImageStream(file)
    }))
    ctx.body = res
  } catch (err) {
    ctx.throw(403, err)
  }
})

export default router;

