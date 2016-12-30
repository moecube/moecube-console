import * as Mongorito from 'mongorito';
import Model = Mongorito.Model;

/**
 * Created by weijian on 2016/12/30.
 */


export function field(target: Model, propertyKey: string): any {
    return {
        get (): any {
            return this.get(propertyKey);
        },
        set (value: any): void {
            this.set(propertyKey, value);
        }
    };
}
