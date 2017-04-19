import Router = require('koa-router');
import {toObjectID} from 'iridium'
import {mongodb} from '../models/iridium'
import {App, AppSchema} from "../models/App";
import * as vercomp from 'vercomp'
import {Context} from "koa";
import {Package} from "../models/Package";
const router = new Router();

// router.get('/apps', async (ctx: Context, next) => {
//   ctx.body = await mongodb.Apps.find({})
//     .map(async app => {
//       if(Array.isArray(app.packages) && app.packages.length > 0){
//         app.packages = await Promise.all(app.packages.map(async p => {
//           try {
//             return await mongodb.Packages.findOne({_id: toObjectID(p)})
//           } catch (e) {
//             console.log(p)
//           }
//         }))
//       }
//       return app
//     })
// });

router.get('/apps', async (ctx: Context, next) => {
  ctx.body = await mongodb.Apps.find({}).toArray()
})

router.post('/apps/:id', async (ctx: Context, next) => {
  if (!ctx.request.body.id || ctx.params.id !== ctx.request.body.id) {
    ctx.throw(400, "App is not same")
  }
  let exists = await mongodb.Apps.findOne({id: ctx.request.body.id});
  if (exists) {
    ctx.throw(400, "App id is exists")
  }

  try {
    ctx.body = await mongodb.Apps.insert(ctx.request.body)
  } catch (e) {
    ctx.throw(400, e)
  }
})

router.patch('/apps/:id', async (ctx: Context, next) => {
  let _app: App = ctx.request.body
  let app: AppSchema | null = await mongodb.Apps.findOne({id: ctx.params.id});
  if (!app) {
    ctx.throw(400, `App ${ctx.params.id} Not Found `);
  }
  if (!ctx.request.body.id || ctx.request.body.id !== app!.id) {
    ctx.throw(400, `Can not change AppID`)
  }

  // if(Array.isArray(data.packages)) {
  //   data.packages = await Promise.all(data.packages.map(async _p => {
  //     if(_p._id) {
  //       const p = await mongodb.Packages.findOne({_id: toObjectID(_p._id)})
  //
  //       if(!_p.platforms) {
  //         ctx.throw(400, `请填写支持的平台：${_p.id}`)
  //       }
  //       else if(!_p.locales) {
  //         ctx.throw(400, `请填写支持的语言：${_p.id}`)
  //       }
  //       else if(!_p.version) {
  //         ctx.throw(400, `请填写版本号：${_p.id}`)
  //       }
  //       else if(vercomp(_p.version, p.version) == -1){
  //         ctx.throw(400, `版本号有误 ：${_p.id}`)
  //       }
  //
  //       if(p.status == 'init') {
  //         p.handleUpdate(_p)
  //         await p.save()
  //         return p._id
  //       }
  //       else {
  //         return p._id
  //       }
  //
  //     } else {
  //       let pack: Package = {
  //         id: _p.id,
  //         name: _p.name,
  //         version: _p.version,
  //         appId: ctx.params.id,
  //         locales: _p.locales,
  //         platforms: _p.platforms,
  //         status: 'init'
  //       }
  //       const newP = await mongodb.Packages.insert(pack)
  //       return newP._id
  //     }
  //   }))
  // }

  app!.handleUpdate(_app)

  ctx.body = await app!.save()
})

router.get('/packages/ready', async (ctx: Context, next) => {
  if (!ctx.request.query.appId) {
    ctx.throw(400, "appId must be required!")
  }
  let packs = await mongodb.Packages.find({appId: ctx.request.query.appId, status: 'uploaded'})
  ctx.body = {
    [ctx.request.query.appId]: packs
  }
})

router.get('/packages/manage', async (ctx: Context, next) => {
  if (!ctx.request.query.appId) {
    ctx.throw(400, "appId must be required!")
  }
  let packs = await mongodb.Packages.find({appId: ctx.request.query.appId, type: 'editing'}).toArray()
  ctx.body = {
    [ctx.request.query.appId]: packs
  }
})


router.post('/packages', async (ctx: Context, next) => {
  const _p: Package = ctx.request.body

  if (!_p.id) {
    ctx.throw(400, `id 参数缺失：${_p.id}`)
  }
  if (!_p.platforms || _p.platforms.length == 0) {
    ctx.throw(400, `请填写支持的平台：${_p.id}`)
  }
  else if (!_p.locales || _p.locales.length == 0) {
    ctx.throw(400, `请填写支持的语言：${_p.id}`)
  }
  else if (!_p.version) {
    ctx.throw(400, `请填写版本号：${_p.id}`)
  }
  await mongodb.Packages.update({id: _p.id}, {$set: { type: 'edited' }}, {multi: true})

  let _pack: Package = {
    id: _p.id,
    name: _p.name,
    version: _p.version,
    appId: _p.appId,
    locales: _p.locales,
    platforms: _p.platforms,
    status: 'init',
    type: 'editing'
  }

  ctx.body = await mongodb.Packages.insert(_pack)
})

router.patch('/packages', async (ctx: Context, next) => {
  const _p: Package = ctx.request.body
  const p = await mongodb.Packages.findOne({_id: toObjectID(_p._id)})

  if (!_p.id) {
    ctx.throw(400, `id 参数缺失：${_p.id}`)
  }
  if (!_p.platforms || _p.platforms.length == 0) {
    ctx.throw(400, `请填写支持的平台：${_p.id}`)
  }
  else if (!_p.locales || _p.locales.length == 0) {
    ctx.throw(400, `请填写支持的语言：${_p.id}`)
  }
  else if (!_p.version) {
    ctx.throw(400, `请填写版本号：${_p.id}`)
  }

  if (p.status == 'init') {
    p.handleUpdate(_p)
    ctx.body = await p.save()
  } else {
    ctx.throw(400, `非法操作：${_p.id}`)
  }
})

router.delete('/packages', async(ctx: Context, next) => {
  const _p: Package = ctx.request.body
  const p = await mongodb.Packages.findOne({_id: toObjectID(_p._id)})

  p.type = 'edited'
  p.status = 'delete'
  await p.save()
  ctx.body = {
    message: 'delete successful'
  }
})

export default router