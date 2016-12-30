import {Db} from 'mongodb';

export async function up(db: Db, next: Function) {
    await db.collection('apps').createIndex('id', {unique: true});
    next();
}

export async function down(db: Db, next: Function) {
    await db.dropCollection('apps');
    next();
}
