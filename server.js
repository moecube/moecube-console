const path = require('path');
const child_process = require('child_process');
const crypto = require('crypto');

const koa = require('koa');
const bodyParser = require('koa-bodyparser');
const route = require('koa-route');
const app = koa();
app.use(bodyParser());

let tasks = new Map();

app.use(route.post('/metalinks/:id', function *(id) {
    let files = this.request.body.map(file=>path.normalize(file));
    let task_id = crypto.createHash('sha256').update(id + files.sort().join(), 'utf8').digest('hex');
    tasks.set(task_id, {app_id: id, files: files});
    this.type = 'application/metalink4+xml';
    this.body = `<?xml version="1.0" encoding="UTF-8"?>
<metalink xmlns="urn:ietf:params:xml:ns:metalink">
    <file name="${task_id}.tar.xz">
        <url priority="1">http://thief.mycard.moe/update/tasks/${task_id}.tar.xz</url>
        <url priority="1">http://thief.my-card.in/update/tasks/${task_id}.tar.xz</url>
    </file>
</metalink>`
}));

app.use(route.get('/tasks/:id.tar.xz', function *(id) {
    let task = tasks.get(id);
    let tar = child_process.spawn('tar', ['-Jc', '-C', path.join('apps', task.app_id)].concat(task.files), {XZ_OPT: '-9e'});
    this.body = tar.stdout;
}));

app.listen(3000);