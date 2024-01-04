// XXX: This file has the same tests as test/unit/compile.test.ts, keep them in sync.

import { describe, expect, spyOn, test } from 'bun:test';
// eslint-disable-next-line import/no-duplicates
import { compile } from '../../src/macro' assert { type: 'macro' };
// eslint-disable-next-line import/no-duplicates
import { compile as compileNoMacro } from '../../src/macro';

describe('compile', () => {
  // FIXME: Test for each of the compile macro options; keepComments, keepSpace
  //  ↳ When keepComments, check refs metadata calculations are still correct.
  //  ↳ Currently blocked by bun bug; https://github.com/oven-sh/bun/issues/3832

  test('outputs an object', () => {
    const meta = compile('<div></div>');
    expect(meta).toBeInstanceOf(Object);
  });
  test('outputs html property with string value', () => {
    const meta = compile('<div></div>');
    expect(meta).toHaveProperty('html');
    expect(typeof meta.html).toBe('string');
  });
  test('outputs k property with array value', () => {
    const meta = compile('<div></div>');
    expect(meta).toHaveProperty('k');
    expect(meta.k).toBeInstanceOf(Array);
  });
  test('outputs d property with array value', () => {
    const meta = compile('<div></div>');
    expect(meta).toHaveProperty('d');
    expect(meta.d).toBeInstanceOf(Array);
  });

  test('has empty k and d properties when no node refs', () => {
    const meta = compile('<div></div>');
    expect(meta.k).toHaveLength(0);
    expect(meta.d).toHaveLength(0);
  });

  test('has 3 k and d properties when 3 node refs', () => {
    const meta = compile('<div @a><div @b></div><div @c></div></div>');
    expect(meta.k).toHaveLength(3);
    expect(meta.d).toHaveLength(3);
  });

  test('has 3 k and d properties when 3 node refs with whitespace', () => {
    const meta = compile(`
      <div>
        <div @a></div>
        <div @b></div>
        <div @c></div>
      </div>
    `);
    expect(meta.k).toHaveLength(3);
    expect(meta.d).toHaveLength(3);
  });

  test('has 3 k and d properties when 3 node refs with messy whitespace', () => {
    const meta = compile(
      '\n\n\t<div><div     @a  ></div> \t\t\n\n\n<div \f\n\r\t\v\u0020\u00A0\u1680\u2000\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF @b></  div> <div @c></\n\tdiv>\n\n</div>\n',
    );
    expect(meta.k).toHaveLength(3);
    expect(meta.d).toHaveLength(3);
  });

  test('has 1 k and d properties when 1 text ref', () => {
    const meta = compile('<div>@a</div>');
    expect(meta.k).toHaveLength(1);
    expect(meta.d).toHaveLength(1);
  });

  // TODO: Add documentation about this since it differs from the default compile.ts h() behaviour
  test('has 1 k and d properties when 1 text ref with whitespace', () => {
    const meta = compile(`<div> @a</div>`);
    expect(meta.k).toHaveLength(1);
    expect(meta.d).toHaveLength(1);
  });

  test('has empty k and d properties when escaped node ref', () => {
    const meta = compile('<div \\@a></div>');
    expect(meta.k).toHaveLength(0);
    expect(meta.d).toHaveLength(0);
  });

  test('has empty k and d properties when escaped text ref', () => {
    const meta = compile('<div>\\@a</div>');
    expect(meta.k).toHaveLength(0);
    expect(meta.d).toHaveLength(0);
  });

  test('does not minify in whitespace-sensitive blocks', () => {
    const meta = compile(`
      <div>
        <pre>
          a
           b
          c


          &lt;span&gt; Foo  &lt;/span&gt;
        </pre>
        <span>
          Bar
        </span>
        <code>
          &lt;span&gt;
            Baz
          &lt;/span&gt;
        </code>

      </div>
    `);
    expect(meta.html).toBe(
      '<div><pre>\n          a\n           b\n          c\n\n\n          &lt;span&gt; Foo  &lt;/span&gt;\n        </pre><span>Bar</span><code>\n          &lt;span&gt;\n            Baz\n          &lt;/span&gt;\n        </code></div>',
    );
  });

  test('does not escape HTML entities', () => {
    const template = '<div>&lt;span&gt;Foo&lt;/span&gt;</div>';
    const meta = compile(template);
    expect(meta.html).toBe(template);
  });

  test('logs error when more than one root element', () => {
    const spy = spyOn(console, 'error').mockImplementation(() => {});
    const template = '<div></div><div></div>';
    compileNoMacro(template);
    expect(spy).toHaveBeenCalledWith('Expected template to have a single root element:', template);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  test('returns expected html for basic template', () => {
    const meta = compile(`
      <ul>
        <li>A</li>
        <li>B</li>
        <li>C</li>
      </ul>
    `);
    expect(meta.html).toBe('<ul><li>A</li><li>B</li><li>C</li></ul>');
  });

  // TODO: Test once lol-html (which powers bun's HTMLRewriter) fix their whitespace handling
  test.skip('returns expected html for basic template with messy whitespace', () => {
    const meta = compile(`
      <ul>
        <li \f\n\r\t\v\u0020\u00A0\u1680\u2000\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF   >A</li>
        <li
          >
            B</li>
        <li>C
          </li>
      </ul>
    `);
    expect(meta.html).toBe('<ul><li>A</li><li>B</li><li>C</li></ul>');
  });

  test('returns expected html for SVG template', () => {
    const meta = compile(`
      <svg>
        <circle cx=10 cy='10' r="10" />
      </svg>
    `);
    expect(meta.html).toBe(`<svg><circle cx=10 cy='10' r="10" /></svg>`);
  });

  describe('keepComments option', () => {
    test('removes comments by default', () => {
      const meta = compile('<div><!-- comment --></div>');
      expect(meta.html).toBe('<div></div>');
    });

    test('keeps comment when option is true', () => {
      const meta = compile('<div><!-- comment --></div>', { keepComments: true });
      expect(meta.html).toBe('<div><!-- comment --></div>');
    });

    test('removes comment when option is false', () => {
      const meta = compile('<div><!-- comment --></div>', { keepComments: false });
      expect(meta.html).toBe('<div></div>');
    });

    test('keeps multiple comments when option is true', () => {
      const meta = compile('<div><!-- comment --><!-- comment --><!-- comment --></div>', {
        keepComments: true,
      });
      expect(meta.html).toBe('<div><!-- comment --><!-- comment --><!-- comment --></div>');
    });

    test('removes multiple comments when option is false', () => {
      const meta = compile('<div><!-- comment --><!-- comment --><!-- comment --></div>', {
        keepComments: false,
      });
      expect(meta.html).toBe('<div></div>');
    });

    test('keeps comment when option is true and template is only comment', () => {
      const meta = compile('<!-- comment -->', { keepComments: true });
      expect(meta.html).toBe('<!-- comment -->');
    });

    test('removes comment when option is false and template is only comment', () => {
      const meta = compile('<!-- comment -->', { keepComments: false });
      expect(meta.html).toBe('');
    });

    const templates = [
      '<div><!-- comment --></div>',
      '<div><!-- --></div>',
      '<div><!----></div>',
      '<div><!---></div>',
      '<div><!--></div>',
      '<div><!------></div>',
      '<div><!-- <!-- --></div>',
      '<div><!--  \f\n\r\t\v\u0020\u00A0\u1680\u2000\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF --></div>',
      '<div><!-- comment --!></div>',
      '<div><!-- --!></div>',
      '<div><!----!></div>',
    ];

    test.each(templates)('keeps comment when option is true for %j', (template) => {
      const meta = compileNoMacro(template, { keepComments: true });
      expect(meta.html).toBe(template);
    });

    test.each(templates)('removes comment when option is false for %j', (template) => {
      const meta = compileNoMacro(template, { keepComments: false });
      expect(meta.html).toBe('<div></div>');
    });

    test('has 1 k and d properties when 1 comment ref when option is true', () => {
      const meta = compile('<div><!-- @a --></div>', { keepComments: true });
      expect(meta.k).toHaveLength(1);
      expect(meta.d).toHaveLength(1);
    });

    test('returns expected html for template with comment ref when option is true', () => {
      const meta = compile('<div><!-- @a --></div>', { keepComments: true });
      expect(meta.html).toBe('<div><!--></div>');
    });
  });

  describe('keepSpaces option', () => {
    test('removes spaces between tags and text by default', () => {
      const meta = compile(
        '<div> x   \f\n\r\t\v\u0020\u00A0\u1680\u2000\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF  </div>',
      );
      expect(meta.html).toBe('<div>x</div>');
    });

    test('keeps spaces between tags and text when option is true', () => {
      const meta = compile(
        '<div> x   \f\n\r\t\v\u0020\u00A0\u1680\u2000\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF  </div>',
        { keepSpaces: true },
      );
      expect(meta.html).toBe('<div> x </div>');
    });

    test('removes spaces between tags and text when option is false', () => {
      const meta = compile(
        '<div> x   \f\n\r\t\v\u0020\u00A0\u1680\u2000\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF  </div>',
        { keepSpaces: false },
      );
      expect(meta.html).toBe('<div>x</div>');
    });
  });
});
