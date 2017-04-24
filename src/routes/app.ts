import Router = require('koa-router');
import {mongodb} from '../models/Iridium';
import {App, AppSchema} from '../models/App';
import {Context} from 'koa';
const router = new Router();

router.get('/v2/apps', async (ctx: Context, next) => {
  ctx.body = await mongodb.Apps.find({}).toArray();
});

router.get('/v1/apps', async (ctx: Context, next) => {
  let payload = ctx.request.query;
  if ((!payload.author && !payload.admin)) {
    ctx.throw(400, 'params error');
  }

  let apps = {};
  if (payload.admin == 'true') {
    apps = await mongodb.Apps.find({}).toArray();
  } else {
    apps = await mongodb.Apps.find({author: payload.author}).toArray();
  }
  ctx.body = apps;
});

router.post('/v1/app/:id', async (ctx: Context, next) => {
  let payload = ctx.request.body;
  if (!payload.id) {
    ctx.throw(400, 'params error');
  }
  if (ctx.params.id !== payload.id) {
    ctx.throw(400, 'App is not same');
  }
  let exists = await mongodb.Apps.findOne({id: payload.id});
  if (exists) {
    ctx.throw(400, 'App is exists');
  }

  try {
    ctx.body = await mongodb.Apps.insert(payload);
  } catch (e) {
    ctx.throw(400, e);
  }
});

router.patch('/v1/app/:id', async (ctx: Context, next) => {
  let _app: App = ctx.request.body;
  let app: AppSchema | null = await mongodb.Apps.findOne({id: ctx.params.id});
  if (!app) {
    ctx.throw(400, `App ${ctx.params.id} Not Found `);
  }
  if (!ctx.request.body.id || ctx.request.body.id !== app!.id) {
    ctx.throw(400, `Can not change AppID`);
  }

  app!.handleUpdate(_app);

  ctx.body = await app!.save();
});

export default router;
