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

router.get('/v1/apps', async (ctx: Context, next) => {
  ctx.body = await mongodb.Apps.find({}).toArray()
})

router.post('/v1/app/:id', async (ctx: Context, next) => {
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

router.patch('/v1/app/:id', async (ctx: Context, next) => {
  let _app: App = ctx.request.body
  let app: AppSchema | null = await mongodb.Apps.findOne({id: ctx.params.id});
  if (!app) {
    ctx.throw(400, `App ${ctx.params.id} Not Found `);
  }
  if (!ctx.request.body.id || ctx.request.body.id !== app!.id) {
    ctx.throw(400, `Can not change AppID`)
  }

  app!.handleUpdate(_app)

  ctx.body = await app!.save()
})

export default router