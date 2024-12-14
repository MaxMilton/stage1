import { afterEach, describe, expect, mock, test } from 'bun:test';
import { cleanup, render } from '@maxmilton/test-utils/dom';
import { deleteSyntheticEvent, setupSyntheticEvent } from '../../src/events';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    __click?(event: MouseEvent): void | false | Promise<void>;
  }
}

describe('setupSyntheticEvent', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(setupSyntheticEvent).toBeFunction();
    expect(setupSyntheticEvent).not.toBeClass();
  });

  test('expects 1 parameter', () => {
    expect.assertions(1);
    expect(setupSyntheticEvent).toHaveParameters(1, 0);
  });

  test('returns undefined', () => {
    expect.assertions(1);
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(setupSyntheticEvent('abort')).toBeUndefined();
  });

  describe('rendered', () => {
    afterEach(cleanup);

    test('calls synthetic click handler on click event', () => {
      expect.assertions(1);
      const button = document.createElement('button');
      const callback = mock(() => {});
      button.__click = callback;
      render(button);
      setupSyntheticEvent('click');
      button.click();
      button.click();
      button.click();
      expect(callback).toHaveBeenCalledTimes(3);
      deleteSyntheticEvent('click');
    });

    test('propagates click event from deeply nested element', () => {
      expect.assertions(1);
      const button = document.createElement('button');
      const div = document.createElement('div');
      const span = document.createElement('span');
      const img = document.createElement('img');
      const callback = mock(() => {});
      button.__click = callback;
      button.appendChild(div);
      div.appendChild(span);
      span.appendChild(img);
      render(button);
      setupSyntheticEvent('click');
      img.click();
      img.click();
      img.click();
      expect(callback).toHaveBeenCalledTimes(3);
      deleteSyntheticEvent('click');
    });

    test('propagates up to document body', () => {
      expect.assertions(1);
      const button = document.createElement('button');
      const callback = mock(() => {});
      document.body.__click = callback;
      render(button);
      setupSyntheticEvent('click');
      button.click();
      expect(callback).toHaveBeenCalledTimes(1);
      deleteSyntheticEvent('click');
      // biome-ignore lint/performance/noDelete: cleanup
      delete document.body.__click;
    });

    test('no longer propagates click event once handled', () => {
      expect.assertions(1);
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const callback = mock(() => {});
      div1.__click = callback;
      div2.__click = callback;
      div1.appendChild(div2);
      render(div1);
      setupSyntheticEvent('click');
      div2.click();
      expect(callback).toHaveBeenCalledTimes(1); // only called once
      deleteSyntheticEvent('click');
    });

    test('does not call handler if synthetic event is not setup', () => {
      expect.assertions(1);
      const button = document.createElement('button');
      const callback = mock(() => {});
      button.__click = callback;
      render(button);
      button.click();
      expect(callback).not.toHaveBeenCalled();
    });

    test('does not call handler if event originates from another DOM tree branch', () => {
      expect.assertions(2);
      const div = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      const callback1 = mock(() => {});
      const callback2 = mock(() => {});
      button1.__click = callback1;
      button2.__click = callback2;
      render(div);
      div.appendChild(button1);
      div.appendChild(button2);
      setupSyntheticEvent('click');
      button1.click();
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).not.toHaveBeenCalled();
      deleteSyntheticEvent('click');
    });

    test('only registers synthetic click handler once', () => {
      expect.assertions(1);
      const button = document.createElement('button');
      const callback = mock(() => {});
      button.__click = callback;
      render(button);
      setupSyntheticEvent('click');
      setupSyntheticEvent('click');
      button.click();
      expect(callback).toHaveBeenCalledTimes(1);
      deleteSyntheticEvent('click');
    });
  });
});

describe('deleteSyntheticEvent', () => {
  test('is a function', () => {
    expect.assertions(2);
    expect(deleteSyntheticEvent).toBeFunction();
    expect(deleteSyntheticEvent).not.toBeClass();
  });

  test('expects 1 parameter', () => {
    expect.assertions(1);
    expect(setupSyntheticEvent).toHaveParameters(1, 0);
  });

  test('returns undefined', () => {
    expect.assertions(1);
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(deleteSyntheticEvent('abort')).toBeUndefined();
  });

  describe('rendered', () => {
    afterEach(cleanup);

    test('does not call synthetic click handler after delete', () => {
      expect.assertions(2);
      const button = document.createElement('button');
      const callback = mock(() => {});
      button.__click = callback;
      render(button);
      setupSyntheticEvent('click');
      button.click();
      expect(callback).toHaveBeenCalledTimes(1);
      deleteSyntheticEvent('click');
      button.click();
      button.click();
      button.click();
      expect(callback).toHaveBeenCalledTimes(1); // still only one call
    });
  });
});
