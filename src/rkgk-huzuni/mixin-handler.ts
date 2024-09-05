export class MixinHandler<T extends object> implements ProxyHandler<T> {
  mixins: Map<string | symbol, unknown[]> = new Map();

  set?(target: T, prop: string | symbol, value) {
    if (typeof value !== 'function') {
      console.error(
        "[huzuni] can't set mixin with value different than function",
      );
      return false;
    }

    if (!this.mixins.has(prop)) {
      this.mixins.set(prop, []);
    }

    this.mixins.get(prop).push(value);
    console.debug(`[huzuni] registered mixin for`, prop);
    return true;
  }

  get?(target: T, p: string | symbol) {
    if (typeof target[p] === 'function') {
      return new Proxy(target[p], {
        apply: (targetFn, thisArg, argumentsList) => {
          if (!this.mixins.get(p)) {
            return Reflect.apply(targetFn, thisArg, argumentsList);
          }

          for (const mixs of this.mixins.get(p)) {
            (mixs as typeof targetFn).apply(target, argumentsList);
          }
          return Reflect.apply(targetFn, thisArg, argumentsList);
        },
      });
    } else {
      return Reflect.get(target, p);
    }
  }
}
