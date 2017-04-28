import Router = require('koa-router');
import {mongodb} from '../models/Iridium';
import {App} from '../models/App';
import {Context} from 'koa';
import * as joi from 'joi';
import {promisify as py} from 'bluebird';
import {dot} from '../utils';
const router = new Router();

const isTest = process.env['ENV'] !== 'production';

let validate: any = py(joi.validate);

router.get('/v2/apps', async (ctx: Context, next) => {
  ctx.body = await mongodb.Apps.find({}).toArray();
});

router.get('/v1/apps', async (ctx: Context, next) => {
  let payload = ctx.request.query;
  if ((!payload.author && !payload.admin)) {
    ctx.throw(400, 'params error');
  }

  let apps = {};
  if (isTest || payload.admin == 'true') {
    apps = await mongodb.Apps.find({}).map(app => {
      if (app.files) {
        app.files = Object.assign({}, ...Object.keys(app.files).map(key => ({[key.replace(new RegExp(dot, 'g'), '.')]: app.files![key]})));
      }
      return app;
    });
  } else {
    apps = await mongodb.Apps.find({author: payload.author}).map(app => {
      if (app.files) {
        app.files = Object.assign({}, ...Object.keys(app.files).map(key => ({[key.replace(new RegExp(dot, 'g'), '.')]: app.files![key]})));
      }
      return app;
    });
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
      await validate(_app, joi.object().keys({
        action: joi.object().required(),
      }).required());
    } catch (e) {
      e.message = '资料尚未填写完毕或格式有误';
      return ctx.throw(e);
    }
  }
  if (_app.files && Object.keys(_app.files).length > 0) {
    _app.files = Object.assign({}, ...Object.keys(_app.files).map(key => ({[key.replace(new RegExp('\\.', 'g'), dot)]: _app.files[key]})));
  }

  app.handleUpdate(_app);

  ctx.body = await app.save();
});

export default router;
