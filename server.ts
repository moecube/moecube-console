if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
import * as Koa from 'koa'
import * as log4js from 'log4js'
import * as bodyParser from 'koa-bodyparser'
import * as hbs from 'koa-hbs'
import { mongodb } from './src/models/iridium'

// import index from './routes/index';
import upload from './src/routes/upload';
// import users from './src/routes/users';
import package from './src/routes/package'
import apps from './src/routes/app';
// import packages from './routes/packages';


const logger = log4js.getLogger();

const app = new Koa();

app.use(hbs.middleware({
    viewPath: __dirname + '/views',
}));

app.use(async(ctx, next) => {
    const start = new Date();
    await next();
    const ms = Date.now() - start.getTime();
    ctx.set('X-Response-Time', `${ms}ms`);
});

// 错误处理
app.use(async(ctx, next) => {
    try {
        await next();
    } catch (err) {
        // will only respond with JSON
        console.log(err);
        ctx.status = err.status || 500;
        ctx.body = {
            message: err.message,
        };
        if (err.errCode) {
            ctx.body['errCode'] = err.errCode;
        }
        if (ctx.response.status >= 500) {
            logger.error(err);
        } else if (ctx.response.status >= 400) {
            logger.warn(err);
        }
    }
});

// 跨域
app.use(async(ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With',);
    if (ctx.method === 'OPTIONS') {
        ctx.status = 204;
    } else {
        await next();
    }
});


app.use(bodyParser());
// app.use(index.routes());
// app.use(users.routes());
app.use(apps.routes());
app.use(upload.routes());
app.use(package.routes());
// app.use(packages.routes());

mongodb.connect().then(() => {
  app.listen(8001, () => {
    console.log("app listening port 8001")
  });
})


