'use strict';

const Koa = require('koa');

const app = new Koa();

app.use(require('./routes/download').routes());
app.use(require('./routes/publish').routes());

const latest = require('./models/latest');
latest.refresh().then(()=> {
    console.log(latest);
    app.listen(80);
});
