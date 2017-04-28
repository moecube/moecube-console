import Router = require('koa-router');
import {toObjectID} from 'iridium';
import {mongodb} from '../models/Iridium';
import {Context} from 'koa';
import config from '../../config';
import {Archive, Package} from '../models/Package';
import {renderChecksum} from '../utils';
const router = new Router();

router.get('/v2/packages', async (ctx: Context, next) => {
  if (!ctx.request.query.appId) {
    ctx.throw(400, 'appId must be required!');
  }
  let packs = await mongodb.Packages.find({
    appId: ctx.request.query.appId,
    status: 'uploaded'
  }).toArray();
  ctx.body = packs
});


router.get('/v2/package/:id/checksum', async (ctx: Context, next) => {
  let pack = await mongodb.Packages.findOne({id: ctx.params.id, status: 'uploaded'});
  if (!pack) {
    return ctx.throw(400, 'pack error');
  }

  ctx.body = renderChecksum(pack.files);
});

router.get('/v2/package/:id/meta', async (ctx: Context, next) => {

  let pack = await mongodb.Packages.findOne({id: ctx.params.id, status: 'uploaded'});
  if (!pack) {
    return ctx.throw(400, 'pack error');
  }

  await ctx['render']('update', {
    files: {
      name: pack.id,
      size: pack.fullSize,
      hash: pack.fullHash
    }
  });
});

router.post('/v2/package/:id/update', async (ctx: Context, next) => {
  const package_id = ctx.params.id;
  const request_overhead = 1024 * 1024;
  let sandSize = ctx.request.body.length * request_overhead;


  let pack = await mongodb.Packages.findOne({id: package_id, status: 'uploaded'});
  if (!pack) {
    return ctx.throw(400, 'pack not exists');
  }
  let {fullSize} = pack;


  let files;
  let fullFiles = new Map<string, Archive>();

  pack.archives.map((f) => {
    fullFiles.set(f.path, f);
  });

  if (fullSize > sandSize) {
    files = ctx.request.body.map((_file) => {
      const file: Archive | undefined = fullFiles.get(_file);
      if (!file) {
        return ctx.throw(400, '');
      }
      sandSize += file.size;
      return {
        path: file.path,
        size: file.size,
        hash: file.hash
      };
    });
  }

  if (sandSize <= fullSize) {
    files = [{
      path: pack.id,
      size: pack.fullSize,
      hash: pack.fullHash
    }];
  }

  await ctx['render']('update', {files});
});


router.get('/v1/packages', async (ctx: Context, next) => {
  if (!ctx.request.query.appId) {
    ctx.throw(400, 'appId must be required!');
  }
  let packs = await mongodb.Packages.find({
    appId: ctx.request.query.appId,
    type: 'editing'
  }).toArray();
  ctx.body = {
    [ctx.request.query.appId]: packs
  };
});

router.post('/v1/package', async (ctx: Context, next) => {
  const _p: Package = ctx.request.body;

  if (!_p.id) {
    ctx.throw(400, `id 参数缺失：${_p.id}`);
  }
  if (!_p.platforms || _p.platforms.length == 0) {
    ctx.throw(400, `请填写支持的平台：${_p.id}`);
  } else if (!_p.locales || _p.locales.length == 0) {
    ctx.throw(400, `请填写支持的语言：${_p.id}`);
  } else if (!_p.version) {
    ctx.throw(400, `请填写版本号：${_p.id}`);
  }

  let existsPlatform = await mongodb.Packages.find({
    id: {$ne: _p.id},
    appId: _p.appId,
    platforms: {$in: _p.platforms},
    type: 'editing'
  }).count();
  if (existsPlatform) {
    console.log(existsPlatform);
    ctx.throw(400, '平台已存在');
  }

  let existsLocales = await mongodb.Packages.find({
    id: {$ne: _p.id},
    appId: _p.appId,
    locales: {$in: _p.locales},
    type: 'editing'
  }).count();
  if (existsLocales) {
    console.log(existsLocales);
    ctx.throw(400, '语言已存在');
  }

  await mongodb.Packages.update({id: _p.id}, {$set: {type: 'edited'}}, {multi: true});

  let _pack: Package = {
    id: _p.id,
    name: _p.name,
    version: _p.version,
    appId: _p.appId,
    locales: _p.locales,
    platforms: _p.platforms,
    status: 'init',
    type: 'editing'
  };

  ctx.body = await mongodb.Packages.insert(_pack);
});

router.patch('/v1/package', async (ctx: Context, next) => {
  const _p = ctx.request.body;
  const p = await mongodb.Packages.findOne({_id: toObjectID(_p._id)});
  if (!p) {
    return ctx.throw(400, 'pack not exists');
  }

  if (!_p.id) {
    ctx.throw(400, `id 参数缺失：${_p.id}`);
  }
  if (!_p.platforms || _p.platforms.length == 0) {
    ctx.throw(400, `请填写支持的平台：${_p.id}`);
  } else if (!_p.locales || _p.locales.length == 0) {
    ctx.throw(400, `请填写支持的语言：${_p.id}`);
  } else if (!_p.version) {
    ctx.throw(400, `请填写版本号：${_p.id}`);
  }

  let existsPlatform = await mongodb.Packages.find({
    id: {$ne: _p.id},
    appId: _p.appId,
    platforms: {$in: _p.platforms},
    type: 'editing'
  }).count();
  if (existsPlatform) {
    console.log(existsPlatform);
    ctx.throw(400, '平台已存在');

  }

  let existsLocales = await mongodb.Packages.find({
    id: {$ne: _p.id},
    appId: _p.appId,
    locales: {$in: _p.locales},
    type: 'editing'
  }).count();
  if (existsLocales) {
    console.log(existsLocales);
    ctx.throw(400, '语言已存在');
  }

  if (p.status == 'init') {
    p.handleUpdate(_p);
    ctx.body = await p.save();
  } else {
    ctx.throw(400, `非法操作：${_p.id}`);
  }
});

router.delete('/v1/package', async (ctx: Context, next) => {
  const _p = ctx.request.body;
  const p = await mongodb.Packages.findOne({_id: toObjectID(_p._id)});
  if (!p) {
    return ctx.throw(400, 'pack not exists');
  }

  p.type = 'edited';
  p.status = 'delete';
  await p.save();
  ctx.body = {
    message: 'delete successful'
  };
});

export default router;
