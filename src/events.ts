const configuredEvents: Record<string, true | null> = {};

const nativeToSyntheticEvent = (event: Event) => {
  // eslint-disable-next-line prefer-template
  const eventKey = '__' + event.type;
  let node = event.target as Node | null;

  while (node) {
    // @ts-expect-error - unavoidable string indexing
    if (node[eventKey]) {
      // @ts-expect-error - unavoidable string indexing
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      return node[eventKey](event);
    }
    node = node.parentNode;
  }
};

export const setupSyntheticEvent = (type: keyof DocumentEventMap): void => {
  configuredEvents[type] ??=
    // biome-ignore lint/style/noCommaOperator: code compactness
    (document.addEventListener(type, nativeToSyntheticEvent), true);
};

export const deleteSyntheticEvent = (type: keyof DocumentEventMap): void => {
  configuredEvents[type] = null;
  document.removeEventListener(type, nativeToSyntheticEvent);
};
