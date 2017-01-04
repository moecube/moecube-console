/**
 * Created by weijian on 2016/12/30.
 */


export function field(target: any, propertyKey: string): any {
    return {
        get (): any {
            return this.get(propertyKey);
        },
        set (value: any): void {
            this.set(propertyKey, value);
        }
    };
}
