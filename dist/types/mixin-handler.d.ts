export declare class MixinHandler<T extends object> implements ProxyHandler<T> {
    mixins: Map<string | symbol, unknown[]>;
    set?(target: T, prop: string | symbol, value: any): boolean;
    get?(target: T, p: string | symbol): any;
}
