import {STATUS_CODES} from 'http';
/**
 * Created by weijian on 2016/12/29.
 */
export class KoaError extends Error {

    constructor(msg: string, public status: number) {
        super(msg);
    }
}

export class NotFound extends KoaError {
    constructor(msg = STATUS_CODES[404]) {
        super(msg, 404);
    }
}
export class BadRequest extends KoaError {
    constructor(msg = STATUS_CODES[400]) {
        super(msg, 400);
    }
}
export const InternalError = new KoaError(STATUS_CODES[500], 500);

