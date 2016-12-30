import Koa = require('koa');
import logger = require('koa-logger');
import index from './routes/index';
import users from './routes/users';
import apps from './routes/apps';
import packages from './routes/packages';
import bodyParser = require('koa-bodyparser');
import Mongorito = require('mongorito');

const url = require('./mongodb_config.json').dbSettings.connectionString;

const app = new Koa();

app.use(async(ctx, next) => {
    try {
        await next();
    } catch (err) {
        // will only respond with JSON
        ctx.status = err.status || 500;
        ctx.body = {
            message: err.message
        };
    }
});

// 跨域
app.use(async(ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    if (ctx.method === 'OPTIONS') {
        ctx.status = 204;
    } else {
        await next();
    }
});

app.use(logger());
app.use(async(ctx, next) => {
    const start = new Date();
    await next();
    const ms = Date.now() - start.getTime();
    ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(bodyParser());
app.use(index.routes());
app.use(users.routes());
app.use(apps.routes());
app.use(packages.routes());
Mongorito.connect(url).then(() => {
    app.listen(8000);
});
