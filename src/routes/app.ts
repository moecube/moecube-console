import Router = require('koa-router');
import {mongodb} from '../models/Iridium';
import {App} from '../models/App';
import {Context} from 'koa';
import * as joi from 'joi';
import {promisify as py} from 'bluebird';
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
  let payload: App = {
    id: ctx.request.body.id,
    name: ctx.request.body.name,
    author: ctx.request.body.author,
    status: 'editing',
  };
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
    ctx.body = await mongodb.Apps.create(payload);
  } catch (e) {
    ctx.throw(400, e);
  }
});

router.patch('/v1/app/:id', async (ctx: Context, next) => {
  let _app = ctx.request.body;
  let app = await mongodb.Apps.findOne({id: ctx.params.id});
  if (!app) {
    return ctx.throw(400, `App ${ctx.params.id} Not Found `);
  }
  if (!_app.id || _app.id !== app.id) {
    ctx.throw(400, `Can not change AppID`);
  }
  if (_app.status == 'ready') {
    try {
      await py(joi.validate)(_app, joi.object().keys({
        action: joi.object().keys({
          win32: joi.object().required(),
          darwin: joi.object().required()
        }).required(),
      }).required());
    } catch (e) {
      e.message = '资料尚未填写完毕或格式有误';
      return ctx.throw(e);
    }
  }

  app.handleUpdate(_app);

  ctx.body = await app.save();
});

export default router;
