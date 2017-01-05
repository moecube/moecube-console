import Koa = require('koa');
import index from './routes/index';
import users from './routes/users';
import apps from './routes/apps';
import packages from './routes/packages';
import bodyParser = require('koa-bodyparser');
import Mongorito = require('mongorito');
import log4js = require('log4js');

const logger = log4js.getLogger();

const url = require('./mongodb_config.json').dbSettings.connectionString;

const app = new Koa();

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
        console.log(err.status);
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
    ctx.set('Access-Control-Allow-Headers', 'Content-Type');
    if (ctx.method === 'OPTIONS') {
        ctx.status = 204;
    } else {
        await next();
    }
});


app.use(bodyParser());
app.use(index.routes());
app.use(users.routes());
app.use(apps.routes());
app.use(packages.routes());
Mongorito.connect(url).then(() => {
    app.listen(8000);
});

// function getKoaLogger (logger4js, options) {
//     if (typeof options === 'object') {
//         options = options || {}
//     } else if (options) {
//         options = { format: options }
//     } else {
//         options = {}
//     }
//
//     var thislogger = logger4js
//     var level = levels.toLevel(options.level, levels.INFO)
//     var fmt = options.format || DEFAULT_FORMAT
//     var nolog = options.nolog ? createNoLogCondition(options.nolog) : null
//
//     return co.wrap(function *(ctx, next) {
//         // mount safety
//         if (ctx.request._logging) return yield next()
//
//         // nologs
//         if (nolog && nolog.test(ctx.originalUrl)) return yield next()
//         if (thislogger.isLevelEnabled(level) || options.level === 'auto') {
//             var start = new Date()
//             var writeHead = ctx.response.writeHead
//
//             // flag as logging
//             ctx.request._logging = true
//
//             // proxy for statusCode.
//             ctx.response.writeHead = function (code, headers) {
//                 ctx.response.writeHead = writeHead
//                 ctx.response.writeHead(code, headers)
//                 ctx.response.__statusCode = code
//                 ctx.response.__headers = headers || {}
//
//                 // status code response level handling
//                 if (options.level === 'auto') {
//                     level = levels.INFO
//                     if (code >= 300) level = levels.WARN
//                     if (code >= 400) level = levels.ERROR
//                 } else {
//                     level = levels.toLevel(options.level, levels.INFO)
//                 }
//             }
//
//             yield next()
//             // hook on end request to emit the log entry of the HTTP request.
//             ctx.response.responseTime = new Date() - start
//             // status code response level handling
//             if (ctx.res.statusCode && options.level === 'auto') {
//                 level = levels.INFO
//                 if (ctx.res.statusCode >= 300) level = levels.WARN
//                 if (ctx.res.statusCode >= 400) level = levels.ERROR
//             }
//             if (thislogger.isLevelEnabled(level)) {
//                 var combinedTokens = assembleTokens(ctx, options.tokens || [])
//                 if (typeof fmt === 'function') {
//                     var line = fmt(ctx, function (str) {
//                         return format(str, combinedTokens)
//                     })
//                     if (line) thislogger.log(level, line)
//                 } else {
//                     thislogger.log(level, format(fmt, combinedTokens))
//                 }
//             }
//         } else {
//             // ensure next gets always called
//             yield next()
//         }
//     })
// }
