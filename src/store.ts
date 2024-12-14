type Handler<T, K extends keyof T> = (value: T[K], prev: T[K]) => void;
type Store<T> = T & {
  readonly on: <K extends keyof T>(
    key: K,
    callback: Handler<T, K>,
  ) => /** off */ () => void;
};

/**
 * Create a reactive data store.
 *
 * @param initialState - An initial store state object. It must not have an `on`
 * property because that is used to register callback functions.
 *
 * @returns A proxied state object that triggers registered callback handler
 * functions when its properties are set.
 */
export const store = <T extends Record<string | symbol, unknown>>(
  initialState: T & { on?: never },
): Store<T> => {
  const handlers: { [K in keyof T]?: Handler<T, K>[] } = {};

  return new Proxy(
    // proxied state object
    {
      // shallow copy to prevent mutation of the initial state object
      ...initialState,
      on(key, fn) {
        (handlers[key] ??= []).push(fn);
        return /** off */ () => {
          // eslint-disable-next-line no-bitwise
          handlers[key]?.splice(handlers[key].indexOf(fn) >>> 0, 1);
        };
      },
    },
    // setter handler
    {
      set(target, property: keyof T, value: T[keyof T]) {
        handlers[property]?.forEach((fn) => fn(value, target[property]));
        // eslint-disable-next-line no-param-reassign
        (target as T)[property] = value;
        return true;
      },
    },
  );
};
