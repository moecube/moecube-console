import Router = require('koa-router');
import {mongodb} from '../models/iridium'
import {App, AppSchema} from "../models/App";
import {Context} from "koa";
const router = new Router();

router.get('/apps', async (ctx: Context, next) => {
  ctx.body = await mongodb.Apps.find({})
    .map(async app => {
      if(Array.isArray(app.packages) && app.packages.length > 0){
        app.packages = await Promise.all(app.packages.map(async p => {
          return await mongodb.Packages.findOne({id: p})
        }))
      }
      return app
    })
});

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
  let data = ctx.request.body
  let app: AppSchema | null = await mongodb.Apps.findOne({id: ctx.params.id});
  if (!app) {
    ctx.throw(400, `App ${ctx.params.id} Not Found `);
  }
  if (!ctx.request.body.id || ctx.request.body.id !== app!.id) {
    ctx.throw(400, `Can not change AppID`)
  }

  if(Array.isArray(data.packages)) {
    data.packages = await Promise.all(data.packages.map(async _p => {
      const p = await mongodb.Packages.findOne({id: _p.id})
      if(p) {
        p.handleUpdate(_p)
        await p.save()
        return p.id
      } else {
        const newP = await mongodb.Packages.insert(_p)
        return newP.id
      }
    }))
  }

  app!.handleUpdate(data)

  ctx.body = await app!.save()
})

export default router