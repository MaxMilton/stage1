import { describe, expect, mock, test } from 'bun:test';
import { isProxy } from 'node:util/types';
import { store } from '../../src/store';

describe('store', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(store).toBeFunction();
    expect(store).not.toBeClass();
  });

  test('expects 1 parameter', () => {
    expect.assertions(1);
    expect(store).toHaveParameters(1, 0);
  });

  test('returns a Proxy', () => {
    expect.assertions(1);
    const state = store({});
    expect(isProxy(state)).toBeTrue();
  });

  test('returns an object with the same properties', () => {
    expect.assertions(25);
    // eslint-disable-next-line @typescript-eslint/no-extraneous-class
    class TestClass {}
    const s = Symbol('s');
    const initialState = {
      a: 1,
      b: 2,
      c: null,
      d: undefined,
      e: 'hello',
      f: true,
      g: false,
      h: () => {},
      i: [1, 2, 3],
      j: { ja: Number.POSITIVE_INFINITY, jb: Number.NEGATIVE_INFINITY },
      k: Symbol('k'),
      l: new Date(),
      m: new Map(),
      n: new Set(),
      o: document.createElement('div'),
      p: new Error('test'),
      q: Promise.resolve(),
      r: new Promise(() => {}),
      [s]: 'symbol',
      t: new Uint8Array(),
      u: window.location,
      v: new TestClass(),
      w: TestClass,
      x: /test/,
      // biome-ignore lint/complexity/useRegexLiterals: <explanation>
      y: new RegExp('test'), // eslint-disable-line prefer-regex-literals
      z: window,
    };
    const state = store(initialState);
    // eslint-disable-next-line guard-for-in
    for (const key in initialState) {
      expect(state).toHaveProperty(key, initialState[key as keyof typeof initialState]);
    }
  });

  test('returns an object with an on() function', () => {
    expect.assertions(3);
    const state = store({});
    expect(state.on).toBeFunction();
    expect(state.on).not.toBeClass();
    expect(state.on).toHaveParameters(2, 0);
  });

  test('returns off() function from on()', () => {
    expect.assertions(3);
    const state = store({ a: 1 });
    const off = state.on('a', () => {});
    expect(off).toBeFunction();
    expect(off).not.toBeClass();
    expect(off).toHaveParameters(0, 0);
  });

  test('mutating initial state does not mutate store state', () => {
    expect.assertions(1);
    const initialState = { a: 1 };
    const state = store(initialState);
    initialState.a = 2;
    expect(state.a).toBe(1);
  });

  test('mutating store state does not mutate initial state', () => {
    expect.assertions(1);
    const initialState = { a: 1 };
    const state = store(initialState);
    state.a = 2;
    expect(initialState.a).toBe(1);
  });

  test('mutating store state triggers callback', () => {
    expect.assertions(4);
    const initialState = { a: 0 };
    const state = store(initialState);
    const callback = mock(() => {});
    state.on('a', callback);
    state.a = 1;
    expect(callback).toHaveBeenCalledWith(1, 0);
    state.a = 2;
    expect(callback).toHaveBeenCalledWith(2, 1);
    state.a = 3;
    expect(callback).toHaveBeenCalledWith(3, 2);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  test('mutating store state does not trigger callback after off()', () => {
    expect.assertions(2);
    const initialState = { a: 0 };
    const state = store(initialState);
    const callback = mock(() => {});
    const off = state.on('a', callback);
    state.a = 1;
    expect(callback).toHaveBeenCalledTimes(1);
    off();
    state.a = 2;
    state.a = 3;
    expect(callback).toHaveBeenCalledTimes(1); // still called only once
  });

  test('calls callback with new value and previous value', () => {
    expect.assertions(1);
    const initialState = { a: 'old' };
    const state = store(initialState);
    const callback = mock(() => {});
    state.on('a', callback);
    state.a = 'new';
    expect(callback).toHaveBeenCalledWith('new', 'old');
  });

  test('calls all callbacks for mutated property', () => {
    expect.assertions(9);
    const initialState = { a: 0 };
    const state = store(initialState);
    const callback1 = mock(() => {});
    const callback2 = mock(() => {});
    const callback3 = mock(() => {});
    state.on('a', callback1);
    state.on('a', callback2);
    state.on('a', callback3);
    state.a = 1;
    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback3).toHaveBeenCalledTimes(1);
    state.a = 2;
    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(2);
    expect(callback3).toHaveBeenCalledTimes(2);
    state.a = 3;
    state.a = 4;
    expect(callback1).toHaveBeenCalledTimes(4);
    expect(callback2).toHaveBeenCalledTimes(4);
    expect(callback3).toHaveBeenCalledTimes(4);
  });

  test('calls only callbacks for mutated property', () => {
    expect.assertions(12);
    const initialState = { a: 0, b: 0, c: 0 };
    const state = store(initialState);
    const callbackA = mock(() => {});
    const callbackB = mock(() => {});
    const callbackC1 = mock(() => {});
    const callbackC2 = mock(() => {});
    state.on('a', callbackA);
    state.on('b', callbackB);
    state.on('c', callbackC1);
    state.on('c', callbackC2);
    state.a = 1;
    expect(callbackA).toHaveBeenCalledTimes(1);
    expect(callbackB).toHaveBeenCalledTimes(0);
    expect(callbackC1).toHaveBeenCalledTimes(0);
    expect(callbackC2).toHaveBeenCalledTimes(0);
    state.b = 2;
    expect(callbackA).toHaveBeenCalledTimes(1);
    expect(callbackB).toHaveBeenCalledTimes(1);
    expect(callbackC1).toHaveBeenCalledTimes(0);
    expect(callbackC2).toHaveBeenCalledTimes(0);
    state.c = 3;
    state.c = 4;
    expect(callbackA).toHaveBeenCalledTimes(1);
    expect(callbackB).toHaveBeenCalledTimes(1);
    expect(callbackC1).toHaveBeenCalledTimes(2);
    expect(callbackC2).toHaveBeenCalledTimes(2);
  });
});
