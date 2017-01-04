/**
 * Created by weijian on 2017/1/4.
 */
class ModelError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class ModelExistsError extends Error {
    constructor(id: string) {
        super(`App ${id} already exists`);
    }
}
