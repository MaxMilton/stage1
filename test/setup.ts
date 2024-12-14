import '@maxmilton/test-utils/extend';

import { setupDOM } from '@maxmilton/test-utils/dom';

const noop = () => {};

function setupMocks(): void {
  // @ts-expect-error - noop stub
  global.performance.mark = noop;
  // @ts-expect-error - noop stub
  global.performance.measure = noop;

  // TODO: Remove once happy-dom supports `HTMLLIElement` again.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (window.HTMLLIElement) {
    throw new TypeError('HTMLLIElement already defined');
  }
  // @ts-expect-error - mock element
  window.HTMLLIElement = window.HTMLElement;
}

setupDOM();
setupMocks();
