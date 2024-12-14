import { describe, expect, mock, test } from 'bun:test';
import {
  append,
  clone,
  create,
  fragment,
  insert,
  noop,
  onRemove,
  prepend,
  replace,
  text,
} from '../../src/utils';

const ul = document.createElement('ul');
const liA = document.createElement('li');
liA.className = 'a';
const liB = document.createElement('li');
liB.className = 'b';
const liC = document.createElement('li');
liC.className = 'c';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class Sample {}

const NOT_DOM_NODES = [
  null,
  undefined,
  '',
  'div',
  '<div>',
  '<div></div>',
  0,
  1,
  -1,
  1n,
  -1n,
  Number.MAX_VALUE,
  Number.MIN_VALUE,
  Number.POSITIVE_INFINITY,
  Number.NEGATIVE_INFINITY,
  Number.NaN,
  BigInt(Number.MAX_SAFE_INTEGER + 1),
  true,
  false,
  {},
  [],
  [liA.cloneNode()],
  () => {},
  () => liA.cloneNode(),
  function div() {},
  Sample,
  new Sample(),
  Symbol('test'),
  new Map(),
  new Set(),
  new Int8Array(1),
  new Uint8Array(1),
] as const;

describe('noop', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(noop).toBeFunction();
    expect(noop).not.toBeClass();
  });

  test('expects no parameters', () => {
    expect.assertions(1);
    expect(noop).toHaveParameters(0, 0);
  });

  test('returns undefined', () => {
    expect.assertions(1);
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(noop()).toBeUndefined();
  });

  test('is an empty function', () => {
    expect.assertions(1);
    expect(noop.toString()).toBe('() => {\n}');
  });
});

describe('fragment', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(fragment).toBeFunction();
    expect(fragment).not.toBeClass();
  });

  test('expects no parameters', () => {
    expect.assertions(1);
    expect(fragment).toHaveParameters(0, 0);
  });

  test('returns a DocumentFragment', () => {
    expect.assertions(1);
    expect(fragment()).toBeInstanceOf(window.DocumentFragment);
  });
});

describe('text', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(text).toBeFunction();
    expect(text).not.toBeClass();
  });

  test('expects 1 parameter', () => {
    expect.assertions(1);
    expect(text).toHaveParameters(1, 0);
  });

  test('returns a Text node', () => {
    expect.assertions(1);
    expect(text('test')).toBeInstanceOf(window.Text);
  });

  test('sets text content', () => {
    expect.assertions(1);
    expect(text('test').textContent).toBe('test');
  });
});

describe('create', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(create).toBeFunction();
    expect(create).not.toBeClass();
  });

  test('expects 1 parameter', () => {
    expect.assertions(1);
    expect(create).toHaveParameters(1, 0);
  });

  const inputs = [
    ['x', window.HTMLUnknownElement],
    ['div', window.HTMLDivElement],
    ['span', window.HTMLSpanElement],
    ['a', window.HTMLAnchorElement],
    ['img', window.HTMLImageElement],
    ['h1', window.HTMLHeadingElement],
    ['h2', window.HTMLHeadingElement],
    ['h3', window.HTMLHeadingElement],
    ['h4', window.HTMLHeadingElement],
    ['h5', window.HTMLHeadingElement],
    ['h6', window.HTMLHeadingElement],
    ['p', window.HTMLParagraphElement],
    ['input', window.HTMLInputElement],
    ['textarea', window.HTMLTextAreaElement],
    ['button', window.HTMLButtonElement],
    ['select', window.HTMLSelectElement],
    ['option', window.HTMLOptionElement],
    ['optgroup', window.HTMLOptGroupElement],
    ['datalist', window.HTMLDataListElement],
    ['form', window.HTMLFormElement],
    ['fieldset', window.HTMLFieldSetElement],
    ['legend', window.HTMLLegendElement],
    ['label', window.HTMLLabelElement],
    ['ul', window.HTMLUListElement],
    ['ol', window.HTMLOListElement],
    ['li', window.HTMLLIElement],
    ['dl', window.HTMLDListElement],
    ['dt', window.HTMLElement],
    ['dd', window.HTMLElement],
    ['table', window.HTMLTableElement],
    ['caption', window.HTMLTableCaptionElement],
    ['thead', window.HTMLTableSectionElement],
    ['tbody', window.HTMLTableSectionElement],
    ['tfoot', window.HTMLTableSectionElement],
    ['colgroup', window.HTMLTableColElement],
    ['col', window.HTMLTableColElement],
    ['tr', window.HTMLTableRowElement],
    ['td', window.HTMLTableCellElement],
    ['th', window.HTMLTableCellElement],
    ['hr', window.HTMLHRElement],
    ['br', window.HTMLBRElement],
    ['pre', window.HTMLPreElement],
    ['blockquote', window.HTMLQuoteElement],
    ['q', window.HTMLQuoteElement],
    ['ins', window.HTMLModElement],
    ['del', window.HTMLModElement],
    ['iframe', window.HTMLIFrameElement],
    ['embed', window.HTMLEmbedElement],
    ['object', window.HTMLObjectElement],
    ['video', window.HTMLVideoElement],
    ['audio', window.HTMLAudioElement],
    ['source', window.HTMLSourceElement],
    ['track', window.HTMLTrackElement],
    ['canvas', window.HTMLCanvasElement],
    ['map', window.HTMLMapElement],
    ['area', window.HTMLAreaElement],
    ['time', window.HTMLTimeElement],
    ['template', window.HTMLTemplateElement],
    ['slot', window.HTMLSlotElement],
  ] as const;

  for (const [input, expected] of inputs) {
    test(`returns ${expected.name} for "${input}" argument`, () => {
      expect.assertions(1);
      // @ts-expect-error - "x" is an intentional invalid element name
      expect(create(input)).toBeInstanceOf(expected);
    });
  }
});

describe('clone', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(clone).toBeFunction();
    expect(clone).not.toBeClass();
  });

  test('expects 1 parameter', () => {
    expect.assertions(1);
    expect(clone).toHaveParameters(1, 0);
  });

  test('throws without parameters', () => {
    expect.assertions(3);
    // @ts-expect-error - intentional invalid parameters
    expect(() => clone()).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    expect(() => clone(null)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(() => clone(undefined)).toThrow(window.TypeError);
  });

  const inputs = [
    document.createElement('div'),
    document.createElement('span'),
    document.createElement('p'),
    document.createElement('a'),
    document.createElement('button'),
    document.createElement('input'),
    document.createElement('textarea'),
    document.createElement('select'),
  ] as const;

  for (const input of inputs) {
    test(`returns cloned ${input.tagName} element`, () => {
      expect.assertions(2);
      const result = clone(input);
      expect(result).not.toBe(input);
      expect(result.tagName).toBe(input.tagName);
    });
  }
});

describe('append', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(append).toBeFunction();
    expect(append).not.toBeClass();
  });

  test('expects 2 parameters', () => {
    expect.assertions(1);
    expect(append).toHaveParameters(2, 0);
  });

  test('throws without parameters', () => {
    expect.assertions(5);
    // @ts-expect-error - intentional invalid parameters
    expect(() => append()).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    expect(() => append(null)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(() => append(undefined)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    expect(() => append(null, null)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(() => append(undefined, undefined)).toThrow(window.TypeError);
  });

  test('throws when parameters are not an element', () => {
    expect.assertions(NOT_DOM_NODES.length * 2);
    for (const input of NOT_DOM_NODES) {
      // @ts-expect-error - intentional invalid parameters
      expect(() => append(ul.cloneNode(), input)).toThrow(window.TypeError);
      // @ts-expect-error - intentional invalid parameters
      expect(() => append(input, ul.cloneNode())).toThrow(window.TypeError);
    }
  });

  test('appends child element', () => {
    expect.assertions(1);
    const root = ul.cloneNode() as HTMLUListElement;
    append(liA.cloneNode(), root);
    append(liB.cloneNode(), root);
    append(liC.cloneNode(), root);
    expect(root.outerHTML).toBe(
      '<ul><li class="a"></li><li class="b"></li><li class="c"></li></ul>',
    );
  });
});

describe('prepend', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(prepend).toBeFunction();
    expect(prepend).not.toBeClass();
  });

  test('expects 2 parameters', () => {
    expect.assertions(1);
    expect(prepend).toHaveParameters(2, 0);
  });

  test('throws without parameters', () => {
    expect.assertions(5);
    // @ts-expect-error - intentional invalid parameters
    expect(() => prepend()).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    expect(() => prepend(null)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(() => prepend(undefined)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    expect(() => prepend(null, null)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(() => prepend(undefined, undefined)).toThrow(window.TypeError);
  });

  test('throws when parameters are not an element', () => {
    expect.assertions(NOT_DOM_NODES.length * 2 - 1); // skip null as child node
    for (const input of NOT_DOM_NODES) {
      // @ts-expect-error - intentional invalid parameters
      expect(() => prepend(ul.cloneNode(), input)).toThrow(window.TypeError);
      // FIXME: happy-dom does not handle this as per spec.
      // eslint-disable-next-line no-continue
      if (input === null) continue;
      // @ts-expect-error - intentional invalid parameters
      expect(() => prepend(input, ul.cloneNode())).toThrow(window.TypeError);
    }
  });

  test('prepends child element', () => {
    expect.assertions(1);
    const root = ul.cloneNode() as HTMLUListElement;
    prepend(liA.cloneNode(), root);
    prepend(liB.cloneNode(), root);
    prepend(liC.cloneNode(), root);
    expect(root.outerHTML).toBe(
      '<ul><li class="c"></li><li class="b"></li><li class="a"></li></ul>',
    );
  });
});

describe('insert', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(insert).toBeFunction();
    expect(insert).not.toBeClass();
  });

  test('expects 2 parameters', () => {
    expect.assertions(1);
    expect(insert).toHaveParameters(2, 0);
  });

  test('throws without parameters', () => {
    expect.assertions(5);
    // @ts-expect-error - intentional invalid parameters
    expect(() => insert()).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    expect(() => insert(null)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(() => insert(undefined)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    expect(() => insert(null, null)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(() => insert(undefined, undefined)).toThrow(window.TypeError);
  });

  test('throws when parameters are not an element', () => {
    expect.assertions(NOT_DOM_NODES.length * 2);
    for (const input of NOT_DOM_NODES) {
      // @ts-expect-error - intentional invalid parameters
      expect(() => insert(ul.cloneNode(), input)).toThrow(window.TypeError);
      // @ts-expect-error - intentional invalid parameters
      expect(() => insert(input, ul.cloneNode())).toThrow(window.TypeError);
    }
  });

  test('throws when target element has no parent', () => {
    expect.assertions(1);
    const target = ul.cloneNode() as HTMLUListElement;
    const node = liA.cloneNode() as HTMLLIElement;
    expect(() => insert(node, target)).toThrow(window.TypeError);
  });

  test('inserts child element after target element', () => {
    expect.assertions(1);
    const root = ul.cloneNode() as HTMLUListElement;
    const target = liA.cloneNode() as HTMLLIElement;
    root.appendChild(target);
    insert(liB.cloneNode(), target);
    insert(liC.cloneNode(), target);
    expect(root.outerHTML).toBe(
      '<ul><li class="a"></li><li class="c"></li><li class="b"></li></ul>',
    );
  });

  // FIXME: Check DOM node is moved to new parent and is in fact the same node + removed from old parent.
  // test('moves existing element to new parent', () => {
  //   expect.assertions(1);
  //   const root = ul.cloneNode() as HTMLUListElement;
  //   const target = liA.cloneNode() as HTMLLIElement;
  //   root.appendChild(target);
  //   const newParent = ul.cloneNode() as HTMLUListElement;
  //   newParent.appendChild(target);
  //   insert(liB.cloneNode(), target);
  //   insert(liC.cloneNode(), target);
  //   expect(root.outerHTML).toBe('<ul><li class="b"></li><li class="c"></li></ul>');
  // });
});

describe('replace', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(replace).toBeFunction();
    expect(replace).not.toBeClass();
  });

  test('expects 2 parameters', () => {
    expect.assertions(1);
    expect(replace).toHaveParameters(2, 0);
  });

  test('throws without parameters', () => {
    expect.assertions(5);
    // @ts-expect-error - intentional invalid parameters
    expect(() => replace()).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    expect(() => replace(null)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(() => replace(undefined)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    expect(() => replace(null, null)).toThrow(window.TypeError);
    // @ts-expect-error - intentional invalid parameters
    // eslint-disable-next-line unicorn/no-useless-undefined
    expect(() => replace(undefined, undefined)).toThrow(window.TypeError);
  });

  test('throws when parameters are not an element', () => {
    expect.assertions(NOT_DOM_NODES.length * 2);
    for (const input of NOT_DOM_NODES) {
      // @ts-expect-error - intentional invalid parameters
      expect(() => replace(ul.cloneNode(), input)).toThrow(window.TypeError);
      // @ts-expect-error - intentional invalid parameters
      expect(() => replace(input, ul.cloneNode())).toThrow(window.TypeError);
    }
  });

  test('throws when target element has no parent', () => {
    expect.assertions(1);
    const target = ul.cloneNode() as HTMLUListElement;
    const node = liA.cloneNode() as HTMLLIElement;
    expect(() => replace(node, target)).toThrow(window.TypeError);
  });

  test('replaces target element with child element', () => {
    expect.assertions(1);
    const root = ul.cloneNode() as HTMLUListElement;
    const target = liA.cloneNode() as HTMLLIElement;
    root.appendChild(target);
    replace(liB.cloneNode(), target);
    replace(liC.cloneNode(), target);
    expect(root.outerHTML).toBe('<ul><li class="c"></li><li class="b"></li></ul>');
  });

  // FIXME: Check DOM node is moved to new parent and is in fact the same node + removed from old parent.
  // test('moves existing element to new parent', () => {
  //   expect.assertions(1);
  //   const root = ul.cloneNode() as HTMLUListElement;
  //   const target = liA.cloneNode() as HTMLLIElement;
  //   root.appendChild(target);
  //   const newParent = ul.cloneNode() as HTMLUListElement;
  //   newParent.appendChild(target);
  //   replace(liB.cloneNode(), target);
  //   replace(liC.cloneNode(), target);
  //   expect(root.outerHTML).toBe('<ul><li class="b"></li><li class="c"></li></ul>');
  // });
});

describe('onRemove', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(onRemove).toBeFunction();
    expect(onRemove).not.toBeClass();
  });

  test('expects 2 parameters', () => {
    expect.assertions(1);
    expect(onRemove).toHaveParameters(2, 0);
  });

  test('calls callback when watched element is removed', async () => {
    expect.assertions(1);
    const spy = mock(() => {});
    const root = document.createElement('div');
    document.body.appendChild(root);
    onRemove(root, spy);
    root.remove();
    await happyDOM.waitUntilComplete();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('calls callback when watched element is moved (remove + add)', async () => {
    expect.assertions(1);
    const spy = mock(() => {});
    const root = document.createElement('div');
    document.body.appendChild(root);
    onRemove(root, spy);
    document.body.appendChild(root);
    await happyDOM.waitUntilComplete();
    expect(spy).toHaveBeenCalledTimes(1);
    root.remove(); // cleanup
  });

  test('calls callback when parent parent element is removed', async () => {
    expect.assertions(1);
    const spy = mock(() => {});
    const root = document.createElement('div');
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    root.appendChild(parent);
    document.body.appendChild(root);
    onRemove(child, spy);
    root.remove();
    await happyDOM.waitUntilComplete();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('does not call callback when nested child element is removed', async () => {
    expect.assertions(1);
    const spy = mock(() => {});
    const root = document.createElement('div');
    const child = document.createElement('div');
    root.appendChild(child);
    document.body.appendChild(root);
    onRemove(root, spy);
    child.remove();
    await happyDOM.waitUntilComplete();
    expect(spy).not.toHaveBeenCalled();
    root.remove(); // cleanup
  });

  test('does not call callback when element is added', async () => {
    expect.assertions(1);
    const spy = mock(() => {});
    const root = document.createElement('div');
    const child = document.createElement('div');
    onRemove(root, spy);
    document.body.appendChild(root);
    root.appendChild(child);
    await happyDOM.waitUntilComplete();
    expect(spy).not.toHaveBeenCalled();
    root.remove(); // cleanup
  });

  test('does not call callback when child element is moved', async () => {
    expect.assertions(1);
    const spy = mock(() => {});
    const root = document.createElement('div');
    const child = document.createElement('div');
    document.body.appendChild(root);
    onRemove(root, spy);
    root.appendChild(child);
    root.appendChild(child);
    await happyDOM.waitUntilComplete();
    expect(spy).not.toHaveBeenCalled();
    root.remove(); // cleanup
  });
});
