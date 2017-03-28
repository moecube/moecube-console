/**
 * Created by weijian on 2016/12/28.
 */
import Router = require('koa-router');
import {NotFound, InternalError} from '../koa/errors';
import {App} from '../models/app';
import {Package} from '../models/Package'
import {ModelError, ModelInvalidError} from '../models/errors';
const router = new Router();

router.get('/apps', async(ctx, next) => {
    let apps: App[]|null  = await App.all();
    

    apps = await Promise.all(apps.map(async app => {
        if(app.packages && app.packages.length > 0) {
            app.packages =  await Promise.all(app.packages.map(async id => {
                return await Package.findOne({id})
            }))
        }

        return app
    }))

    ctx.body = apps
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
    
    try {
        if(ctx.request.body.packages.length > 0) {
            ctx.request.body.packages = await Promise.all(ctx.request.body.packages.map(async _p=> {
                const p: Package|null = await Package.findOne({ id: _p.id })

                if(p) {
                    Object.assign(p, _p)
                    await p.save()
                    return p.id
                }

                const newP = new Package(_p)
                await newP.save()
                return newP.id                 
            }))
        }

        Object.assign(app, ctx.request.body);
        ctx.body = await app.save();
    } catch (error) {
        ctx.throw(403, error)
    }
});

router.delete('/apps/:id', async(ctx, next) => {
    let result = await  App.remove({id: ctx.params.id});
    if (!result.result.n) {
        throw new NotFound(`App ${ctx.params.id} Not Found`);
    }
    ctx.body = result.result;
});

export default router;
