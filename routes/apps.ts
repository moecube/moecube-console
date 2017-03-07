/**
 * Created by weijian on 2016/12/28.
 */
import Router = require('koa-router');
import {NotFound, InternalError} from '../koa/errors';
import {App} from '../models/app';
import {ModelError, ModelInvalidError} from '../models/errors';
const router = new Router();

router.get('/apps', async(ctx, next) => {
    ctx.body = await App.all();
});

router.get('/apps/:id', async(ctx, next) => {
    let app = await App.findOne({id: ctx.params.id});
    if (app) {
        ctx.body = app;
    } else {
        throw new NotFound(`App ${ctx.params.id} Not Found`);
    }
});

router.post('/apps/:id', async(ctx, next) => {
    console.log(ctx.request.body)
    if (!ctx.request.body.id || ctx.params.id !== ctx.request.body.id) {
        throw new ModelInvalidError('App id not same');
    }
    let app = new App(ctx.request.body);
    try {
        ctx.body = await app.save();
    } catch (e) {
        if (e instanceof ModelError) {
            throw e;
        } else {
            throw new InternalError(e);
        }
    }
});

router.patch('/apps/:id', async(ctx, next) => {
    let app: App|null = await App.findOne({id: ctx.params.id});
    if (!app) {
        throw new NotFound(`App ${ctx.params.id} Not Found`);
    }
    if (!ctx.request.body.id || ctx.request.body.id !== app.id) {
        throw new ModelInvalidError('Can not change AppID');
    }
    Object.assign(app, ctx.request.body);
    ctx.body = await app.save();
});

router.delete('/apps/:id', async(ctx, next) => {
    let result = await  App.remove({id: ctx.params.id});
    if (!result.result.n) {
        throw new NotFound(`App ${ctx.params.id} Not Found`);
    }
    ctx.body = result.result;
});

export default router;
