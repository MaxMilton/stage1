import type { InferRefs, LowercaseKeys, Refs } from './types';
import { create } from './utils';

const template = create('template');
const treeWalker = document.createTreeWalker(template);

/**
 * Creates a DOM node from a compiled template.
 * @param html - HTML string.
 */
export const h = <T extends Node & ChildNode = Element>(html: string): T => {
  template.innerHTML = html;
  return template.content.firstChild as T;
};

/**
 * Collects node refs from a compiled template.
 * @param root - Root node.
 * @param k - Ref key names.
 * @param d - Distances from previous ref node or root.
 * @returns An object mapping ref nodes keyed by their ref name. Note that some
 * browsers lowercase rendered HTML element attribute names so we lowercase the
 * typed key names to bring awareness to this.
 */
/* @__NOINLINE__ */
export const collect = <R extends InferRefs<R>>(
  root: Node,
  k: readonly string[],
  d: readonly number[],
): LowercaseKeys<R> => {
  const walker = treeWalker; // local var is faster in some JS engines
  const refs: Refs = {};
  const len = k.length;
  let index = 0;
  let distance: number;
  walker.currentNode = root;

  for (; index < len; index++) {
    distance = d[index];
    while (distance--) walker.nextNode();
    refs[k[index]] = walker.currentNode;
  }

  return refs as LowercaseKeys<R>;
};
