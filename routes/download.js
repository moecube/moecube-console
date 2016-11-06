"use strict";

const router = require('koa-router')();
const latest = require('../models/latest');
const path = require("path");

const download_url = 'https://wudizhanche.mycard.moe/downloads';

router.get('/download', async(ctx) => {
    let file = latest[ctx.query.platform];
    if (!file) {
        throw 'no file';
    }
    ctx.redirect(path.join(download_url, file));
});

router.get('/update', async(ctx)=> {
    if (ctx.query.version < latest.darwin_version) {
        ctx.body = {url: path.join(download_url, latest.darwin_update)}
    } else {
        ctx.response.status = 204
    }
});

module.exports = router;