import { Context } from 'koa';
import { OSS } from 'aliyun-sdk';
import * as busboy from 'async-busboy';
import * as  mime from 'mime';
import * as uuid from 'uuid';
import * as Client from 'aliyun-oss-upload-stream';
import Router = require('koa-router');
const ossStream = Client(new OSS({
  accessKeyId: process.env["OSS_ACCESS_ID"],
  secretAccessKey: process.env["OSS_ACCESS_KEY"],
  endpoint: process.env["OSS_ENDPOINT"],
  apiVersion: '2013-10-15'
}));
const router = new Router()

const UploadImage = async (ctx: Context) => {

  try {
    const { files } = await busboy(ctx.req);
    ctx.body = await Promise.all(files.map(async file => {

      const ext = mime.extension(file.mime);
      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].indexOf(ext) === -1) {
        throw new Error('Unsupported image type');
      }

      const filename = `test/${uuid.v1()}`;

      const upload = ossStream.upload({
        Bucket: process.env["OSS_BUCKET"],
        Key: filename,
        ContentType: file.mimeType
      });

      upload.minPartSize(1048576); // 1M，表示每块part大小至少大于1M

      file.pipe(upload);

      return await new Promise((resolve, reject) => {
        upload.on('error', reject);
        upload.on('uploaded', resolve);
      });
    }));
  } catch (err) {
    ctx.throw(403, err);
  }
};


router.post('/upload/image', UploadImage)

export default router

