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


export class Package extends Model {
    @field
    version: string;
    @field
    locale: Locale[];
    @field
    platform: Platform[];
    @field
    actions: {[key: string]: Action};
}
