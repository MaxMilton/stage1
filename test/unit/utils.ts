/* eslint "@typescript-eslint/no-invalid-void-type": "warn" */

import { type Mock, expect, spyOn } from 'bun:test';

export interface RenderResult {
  /** A wrapper DIV which contains your mounted component. */
  container: HTMLDivElement;
  /**
   * A helper to print the HTML structure of the mounted container. The HTML is
   * prettified and may not accurately represent your actual HTML. It's intended
   * for debugging tests only and should not be used in any assertions.
   *
   * @param element - An element to inspect. Default is the mounted container.
   */
  debug(this: void, element?: Element): void;
  unmount(this: void): void;
}

const mountedContainers = new Set<HTMLDivElement>();

export function render(component: Node): RenderResult {
  const container = document.createElement('div');

  container.appendChild(component);
  document.body.appendChild(container);

  mountedContainers.add(container);

  return {
    container,
    debug(el = container) {
      // const { format } = await import('prettier');
      // const html = await format(el.innerHTML, { parser: 'html' });
      // $console.log(`DEBUG:\n${html}`);

      // FIXME: Replace with biome once it has a HTML parser
      $console.log(`DEBUG:\n${el.innerHTML}`);
    },
    unmount() {
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      container.removeChild(component);
    },
  };
}

export function cleanup(): void {
  if (mountedContainers.size === 0) {
    throw new Error('No components mounted, did you forget to call render()?');
  }

  mountedContainers.forEach((container) => {
    if (container.parentNode === document.body) {
      container.remove();
    }

    mountedContainers.delete(container);
  });
}

// TODO: Use this implementation if happy-dom removes internal performance.now calls.
// const methods = Object.getOwnPropertyNames(performance) as (keyof Performance)[];
//
// export function performanceSpy(): () => void {
//   const spies: Mock<() => void>[] = [];
//
//   for (const method of methods) {
//     spies.push(spyOn(performance, method));
//   }
//
//   return /** check */ () => {
//     for (const spy of spies) {
//       expect(spy).not.toHaveBeenCalled();
//       spy.mockRestore();
//     }
//   };
// }

const originalNow = performance.now.bind(performance);
const methods = Object.getOwnPropertyNames(performance) as (keyof Performance)[];

export function performanceSpy(): () => void {
  const spies: Mock<() => void>[] = [];
  let happydomInternalNowCalls = 0;

  function now() {
    // biome-ignore lint/nursery/useErrorMessage: only used to get stack
    const callerLocation = new Error().stack!.split('\n')[3]; // eslint-disable-line unicorn/error-message
    if (callerLocation.includes('/node_modules/happy-dom/lib/')) {
      happydomInternalNowCalls++;
    }
    return originalNow();
  }

  for (const method of methods) {
    spies.push(
      method === 'now'
        ? spyOn(performance, method).mockImplementation(now)
        : spyOn(performance, method),
    );
  }

  return /** check */ () => {
    for (const spy of spies) {
      if (spy.getMockName() === 'now') {
        // HACK: Workaround for happy-dom calling performance.now internally.
        // biome-ignore lint/nursery/noMisplacedAssertion: only used in tests
        expect(spy).toHaveBeenCalledTimes(happydomInternalNowCalls);
      } else {
        // biome-ignore lint/nursery/noMisplacedAssertion: only used in tests
        expect(spy).not.toHaveBeenCalled();
      }
      spy.mockRestore();
    }
  };
}
