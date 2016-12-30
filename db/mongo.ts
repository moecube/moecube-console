/**
 * Created by weijian on 2016/12/29.
 */
import {MongoClient, Collection, InsertOneWriteOpResult, DeleteWriteOpResultObject} from 'mongodb';
import pluralize = require('pluralize');
interface Config {
    dbSettings: {
        connectionString: string;
    };
}
const config: Config = require('./../mongodb_config.json');


const promise = MongoClient.connect(config.dbSettings.connectionString);


export class Model {
    static get dbName(): string {
        return pluralize(this.name.toLowerCase());
    }

    static async getCollection(): Promise<Collection> {
        let db = await promise;
        return db.collection(this.dbName);
    }

    static async deleteOne(filter: Object): Promise<DeleteWriteOpResultObject> {
        let collection = await this.getCollection();
        return await collection.deleteOne(filter);
    }

    static async findOne(query: Object): Promise<any|null> {
        let collection = await this.getCollection();
        let result = await collection.find(query).limit(1).next();
        if (result) {
            return new this(result);
        } else {
            return null;
        }
    }

    constructor(o: any) {
        for (let [key, value] of Object.entries(o)) {
            this[key] = value;
        }
    }

    async save(): Promise<InsertOneWriteOpResult> {
        let db = await promise;
        return db.collection(Model.dbName).insertOne(this);
    }

}

