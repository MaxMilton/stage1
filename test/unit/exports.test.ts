/* eslint-disable guard-for-in */

import { describe, expect, test } from 'bun:test';
import * as browserExports from '../../src/browser/index';
import * as indexExports from '../../src/index';
import * as macroExports from '../../src/macro';
import * as keyedExports from '../../src/reconcile/keyed';
import * as nonKeyedExports from '../../src/reconcile/non-keyed';
import * as reuseNodesExports from '../../src/reconcile/reuse-nodes';

describe('browser', () => {
  const publicExports = [
    ['h', Function],
    ['html', Function],
    ['collect', Function],
    ['setupSyntheticEvent', Function],
    ['deleteSyntheticEvent', Function],
    ['noop', Function],
    ['fragment', Function],
    ['text', Function],
    ['create', Function],
    ['clone', Function],
    ['append', Function],
    ['prepend', Function],
    ['insert', Function],
    ['replace', Function],
    ['onRemove', Function],
    ['store', Function],
  ] as const;

  for (const [name, type] of publicExports) {
    test(`exports public "${name}" ${type.name}`, () => {
      expect.assertions(2);
      expect(browserExports).toHaveProperty(name);
      expect(browserExports[name]).toBeInstanceOf(type);
    });
  }

  test('does not export any private internals', () => {
    expect.assertions(publicExports.length + 1);
    const publicExportNames = publicExports.map((x) => x[0]);
    for (const name in browserExports) {
      expect(publicExportNames).toContain(name);
    }
    expect(publicExportNames).toHaveLength(Object.keys(browserExports).length);
  });

  test('has no default export', () => {
    expect.assertions(1);
    expect(browserExports).not.toHaveProperty('default');
  });
});

describe('index', () => {
  const publicExports = [
    ['h', Function],
    ['collect', Function],
    ['setupSyntheticEvent', Function],
    ['deleteSyntheticEvent', Function],
    ['noop', Function],
    ['fragment', Function],
    ['text', Function],
    ['clone', Function],
    ['create', Function],
    ['append', Function],
    ['prepend', Function],
    ['insert', Function],
    ['replace', Function],
    ['onRemove', Function],
    ['store', Function],
  ] as const;

  for (const [name, type] of publicExports) {
    test(`exports public "${name}" ${type.name}`, () => {
      expect.assertions(2);
      expect(indexExports).toHaveProperty(name);
      expect(indexExports[name]).toBeInstanceOf(type);
    });
  }

  test('does not export any private internals', () => {
    expect.assertions(publicExports.length + 1);
    const publicExportNames = publicExports.map((x) => x[0]);
    for (const name in indexExports) {
      expect(publicExportNames).toContain(name);
    }
    expect(publicExportNames).toHaveLength(Object.keys(indexExports).length);
  });

  test('has no default export', () => {
    expect.assertions(1);
    expect(indexExports).not.toHaveProperty('default');
  });
});

describe('macro', () => {
  const publicExports = [['compile', Function]] as const;

  for (const [name, type] of publicExports) {
    test(`exports public "${name}" ${type.name}`, () => {
      expect.assertions(2);
      expect(macroExports).toHaveProperty(name);
      expect(macroExports[name]).toBeInstanceOf(type);
    });
  }

  test('does not export any private internals', () => {
    expect.assertions(publicExports.length + 1);
    const publicExportNames = publicExports.map((x) => x[0]);
    for (const name in macroExports) {
      expect(publicExportNames).toContain(name);
    }
    expect(publicExportNames).toHaveLength(Object.keys(macroExports).length);
  });

  test('has no default export', () => {
    expect.assertions(1);
    expect(macroExports).not.toHaveProperty('default');
  });
});

const reconsilers = [
  ['keyed', keyedExports],
  ['non-keyed', nonKeyedExports],
  ['reuse-nodes', reuseNodesExports],
] as const;

for (const [reconsiler, exports] of reconsilers) {
  describe(`reconcile/${reconsiler}`, () => {
    test('exports public "reconcile" Function', () => {
      expect.assertions(2);
      expect(exports).toHaveProperty('reconcile');
      expect(exports.reconcile).toBeInstanceOf(Function);
    });

    test('does not export any private internals', () => {
      expect.assertions(2);
      const publicExportNames = ['reconcile'];
      for (const name in exports) {
        expect(publicExportNames).toContain(name);
      }
      expect(publicExportNames).toHaveLength(Object.keys(exports).length);
    });

    test('has no default export', () => {
      expect.assertions(1);
      expect(exports).not.toHaveProperty('default');
    });
  });
}
