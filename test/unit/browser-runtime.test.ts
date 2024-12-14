// XXX: This file has the same tests as test/unit/runtime.test.ts, keep them in sync.

import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, render } from '@maxmilton/test-utils/dom';
import { collect, h, html } from '../../src/browser/runtime';

describe('h', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(h).toBeFunction();
    expect(h).not.toBeClass();
  });

  test('expects 1 parameters', () => {
    expect.assertions(1);
    expect(h).toHaveParameters(1, 0);
  });

  describe('render', () => {
    afterEach(cleanup);

    test('renders basic template', () => {
      expect.assertions(1);
      const view = h(`
        <ul>
          <li>A</li>
          <li>B</li>
          <li>C</li>
        </ul>
      `);
      const rendered = render(view);
      expect(rendered.container.innerHTML).toBe('<ul><li>A</li><li>B</li><li>C</li></ul>');
    });

    test('renders basic template with messy whitespace', () => {
      expect.assertions(1);
      const view = h(`
        <ul>
          <li \f\n\r\t\v\u0020\u00A0\u1680\u2000\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF   >A</li>
          <li
            >
              B</li>
          <li>C
            </li>
        </ul>
      `);
      const rendered = render(view);
      expect(rendered.container.innerHTML).toBe('<ul><li>A</li><li>B</li><li>C</li></ul>');
    });

    test('renders SVG template', () => {
      expect.assertions(2);
      const view = h(`
        <svg>
          <circle cx=10 cy='10' r="10" />
        </svg>
      `);
      const rendered = render(view);
      expect(view).toBeInstanceOf(window.SVGSVGElement);
      expect(rendered.container.innerHTML).toBe(
        '<svg><circle cx="10" cy="10" r="10"></circle></svg>',
      );
    });

    test('returns root element', () => {
      expect.assertions(3);
      const view = h(`
        <ul id=root>
          <li>A</li>
          <li>B</li>
          <li>C</li>
        </ul>
      `);
      const rendered = render(view);
      expect(view).toBeInstanceOf(window.HTMLUListElement);
      expect(view.id).toBe('root');
      expect(rendered.container.firstChild).toBe(view);
    });

    test('removes refs in template from output DOM', () => {
      expect.assertions(1);
      const view = h(`
        <ul @list>
          <li @item-one>A</li>
          <li @item-two>B</li>
        </ul>
      `);
      const rendered = render(view);
      expect(rendered.container.innerHTML).toBe('<ul><li>A</li><li>B</li></ul>');
    });

    // NOTE: This is not supported by the current implementation of the h()
    // function because it would be too slow.
    test.skip('does not minify in whitespace-sensitive blocks', () => {});
  });
});

describe('html', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(html).toBeFunction();
    expect(html).not.toBeClass();
  });

  test('expects 2 parameters (1 optional)', () => {
    expect.assertions(1);
    expect(html).toHaveParameters(1, 1);
  });

  describe('render', () => {
    afterEach(cleanup);

    test('renders basic template', () => {
      expect.assertions(1);
      const view = html`
        <ul>
          <li>A</li>
          <li>B</li>
          <li>C</li>
        </ul>
      `;
      const rendered = render(view);
      expect(rendered.container.innerHTML).toBe('<ul><li>A</li><li>B</li><li>C</li></ul>');
    });
  });
});

describe('collect', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(collect).toBeFunction();
    expect(collect).not.toBeClass();
  });

  test('expects 2 parameters', () => {
    expect.assertions(1);
    expect(collect).toHaveParameters(2, 0);
  });

  test('collects all refs', () => {
    expect.assertions(39);
    const view = h(`
      <div @a>
        <header @b>
          <nav @c>
            <a @d href="@one">One</a>
            <a @e href="@two">Two</a>
          </nav>
        </header>
        <main @f>
          <h1 @g>Test</h1>
          <p @h><b @i>This</b> is a <a href="@" @j>test</a>.</p>
          <ol @k>
            <li @l id=one>One</li>
            <li @m id=two>Two</li>
          </ol>
          <form @n>
            <input @o />
            <textarea @p></textarea>
            <button @q>Submit</button>
          </form>
        </main>
        <footer @r>
          @s
        </footer>
      </div>
    `);
    const refs = collect(view, view);
    expect(refs.a.nodeName).toEqual('DIV');
    expect(refs.a).toBeInstanceOf(window.HTMLDivElement);
    expect(refs.b.nodeName).toEqual('HEADER');
    expect(refs.b).toBeInstanceOf(window.HTMLElement);
    expect(refs.c.nodeName).toEqual('NAV');
    expect(refs.c).toBeInstanceOf(window.HTMLElement);
    expect(refs.d.nodeName).toEqual('A');
    expect(refs.d).toBeInstanceOf(window.HTMLAnchorElement);
    expect(refs.e.nodeName).toEqual('A');
    expect(refs.e).toBeInstanceOf(window.HTMLAnchorElement);
    expect(refs.f.nodeName).toEqual('MAIN');
    expect(refs.f).toBeInstanceOf(window.HTMLDivElement);
    expect(refs.g.nodeName).toEqual('H1');
    expect(refs.g).toBeInstanceOf(window.HTMLHeadingElement);
    expect(refs.h.nodeName).toEqual('P');
    expect(refs.h).toBeInstanceOf(window.HTMLParagraphElement);
    expect(refs.i.nodeName).toEqual('B');
    expect(refs.i).toBeInstanceOf(window.HTMLElement);
    expect(refs.j.nodeName).toEqual('A');
    expect(refs.j).toBeInstanceOf(window.HTMLAnchorElement);
    expect(refs.k.nodeName).toEqual('OL');
    expect(refs.k).toBeInstanceOf(window.HTMLOListElement);
    expect(refs.l.nodeName).toEqual('LI');
    expect(refs.l).toBeInstanceOf(window.HTMLLIElement);
    expect(refs.m.nodeName).toEqual('LI');
    expect(refs.m).toBeInstanceOf(window.HTMLLIElement);
    expect(refs.n.nodeName).toEqual('FORM');
    expect(refs.n).toBeInstanceOf(window.HTMLFormElement);
    expect(refs.o.nodeName).toEqual('INPUT');
    expect(refs.o).toBeInstanceOf(window.HTMLInputElement);
    expect(refs.p.nodeName).toEqual('TEXTAREA');
    expect(refs.p).toBeInstanceOf(window.HTMLTextAreaElement);
    expect(refs.q.nodeName).toEqual('BUTTON');
    expect(refs.q).toBeInstanceOf(window.HTMLButtonElement);
    expect(refs.r.nodeName).toEqual('FOOTER');
    expect(refs.r).toBeInstanceOf(window.HTMLElement);
    expect(refs.s.nodeName).toEqual('#text');
    expect(refs.s).toBeInstanceOf(window.Text);
    expect(Object.keys(refs)).toHaveLength(19);
  });

  test('collects ref at start of element attributes', () => {
    expect.assertions(4);
    const view = h(`
      <div>
        <input @search id=search name=q class="input search" type=search minlength=2 maxlength=40 placeholder="Search..." autofocus autocomplete=off />
      </div>
    `);
    const refs = collect<{ search: HTMLInputElement }>(view, view);
    expect(refs.search).toBeInstanceOf(window.HTMLInputElement);
    expect(refs.search.id).toBe('search');
    expect(refs.search.name).toBe('q');
    expect(Object.keys(refs)).toHaveLength(1);
  });

  test('collects ref at end of element attributes', () => {
    expect.assertions(4);
    const view = h(`
      <div>
        <input id=search name=q class="input search" type=search minlength=2 maxlength=40 placeholder="Search..." autofocus autocomplete=off @search />
      </div>
    `);
    const refs = collect<{ search: HTMLInputElement }>(view, view);
    expect(refs.search).toBeInstanceOf(window.HTMLInputElement);
    expect(refs.search.id).toBe('search');
    expect(refs.search.name).toBe('q');
    expect(Object.keys(refs)).toHaveLength(1);
  });

  test('collects ref in middle of element attributes', () => {
    expect.assertions(4);
    const view = h(`
      <div>
        <input id=search name=q class="input search" type=search minlength=2 @search maxlength=40 placeholder="Search..." autofocus autocomplete=off />
      </div>
    `);
    const refs = collect<{ search: HTMLInputElement }>(view, view);
    expect(refs.search).toBeInstanceOf(window.HTMLInputElement);
    expect(refs.search.id).toBe('search');
    expect(refs.search.name).toBe('q');
    expect(Object.keys(refs)).toHaveLength(1);
  });

  // NOTE: The regular mode h() function does not support options like the
  // runtime mode compile() macro does. So there's no need to test them here.
});
