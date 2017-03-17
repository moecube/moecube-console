/**
 * Created by weijian on 2016/12/29.
 */
import {Model} from 'mongorito';
import {field} from '../db/decorators';

type Locale = 'zh-CN' | 'en-US' | 'ja-JP'
type Platform = 'win32' | 'linux' | 'darwin'

export interface Action {
    execute: string;
    args: string[];
    env: {};
    open?: string;
}

export interface File {
    path: string,
    size: number,
    hash: string,
}



export class Package extends Model {
    @field
    id: string;
    @field
    appId: string;
    @field
    version: string;
    @field
    locales: Locale[];
    @field
    platforms: Platform[];
    @field
    files: File[];


    static async findAllByApp(appId: string) {
        return await Package.find({appId: appId});
    }
}
