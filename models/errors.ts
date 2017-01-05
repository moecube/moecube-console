import {KoaError} from '../koa/errors';
/**
 * Created by weijian on 2017/1/4.
 */
export abstract class ModelError extends KoaError {
    abstract errCode: string;

    constructor(msg: string, status: number) {
        super(msg, status);
    }

}

export class ModelExistsError extends ModelError {
    errCode: string = 'ERROR_MODULE_EXISTS';

    constructor(msg: string) {
        super(msg, 400);
    }
}

export class ModelInvalidError extends ModelError {
    errCode: string = 'ERROR_MODEL_INVALID';

    constructor(msg: string) {
        super(msg, 400);
    }
}
