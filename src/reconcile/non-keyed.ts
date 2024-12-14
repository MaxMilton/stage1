/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-continue, no-labels, unicorn/no-for-loop, unicorn/no-new-array */

import { noop } from '../utils';

// https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L396C10-L396C30
const findGreatestIndexLEQ = (seq: number[], n: number) => {
  // invariant: lo is guaranteed to be index of a value <= n, hi to be >
  // therefore, they actually start out of range: (-1, last + 1)
  let lo = -1;
  let hi = seq.length;

  // fast path for simple increasing sequences
  if (hi > 0 && seq[hi - 1] <= n) return hi - 1;

  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (seq[mid] > n) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return lo;
};

// return an array of the indices of ns that comprise the longest increasing subsequence within ns
// https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L368C10-L368C46
const longestPositiveIncreasingSubsequence = (
  ns: number[],
  newStart: number,
) => {
  const seq: number[] = [];
  const is: number[] = [];
  const pre = new Array<number>(ns.length);
  const len = ns.length;
  let i = newStart;
  let l = -1;

  for (; i < len; i++) {
    const n = ns[i];
    if (n < 0) continue;
    const j = findGreatestIndexLEQ(seq, n);
    if (j !== -1) pre[i] = is[j];
    if (j === l) {
      l++;
      seq[l] = n;
      is[l] = i;
    } else if (n < seq[j + 1]) {
      seq[j + 1] = n;
      is[j + 1] = i;
    }
  }

  for (i = is[l]; l >= 0; i = pre[i], l--) {
    seq[l] = i;
  }

  return seq;
};

// This is almost straightforward implementation of reconcillation algorithm
// based on ivi documentation:
// https://github.com/localvoid/ivi/blob/2c81ead934b9128e092cc2a5ef2d3cabc73cb5dd/packages/ivi/src/vdom/implementation.ts#L1366
// With some fast paths from Surplus implementation:
// https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L86
//
// How this implementation differs from others, is that it's working with data directly,
// without maintaining nodes arrays, and uses dom props firstChild/lastChild/nextSibling
// for markers moving.
export const reconcile = <T, N extends Node>(
  parent: Element,
  renderedData: T[],
  data: T[],
  createFn: (itemData: T) => N,
  updateFn: (node: N, itemData: T) => void = noop,
  beforeNode?: Node,
  afterNode?: Node | null,
): void => {
  // Fast path for clear
  if (data.length === 0) {
    if (beforeNode !== undefined || afterNode !== undefined) {
      let node =
        beforeNode === undefined ? parent.firstChild : beforeNode.nextSibling;
      let tmp: ChildNode | null;

      if (afterNode === undefined) afterNode = null;

      while (node !== afterNode) {
        tmp = node!.nextSibling;
        node!.remove();
        node = tmp;
      }
    } else {
      parent.textContent = '';
    }
    return;
  }

  // Fast path for create
  if (renderedData.length === 0) {
    let node: Node;
    const mode = afterNode === undefined ? 0 : 1;
    for (let i = 0, len = data.length; i < len; i++) {
      node = createFn(data[i]);
      if (mode) {
        parent.insertBefore(node, afterNode!);
      } else {
        parent.appendChild(node);
      }
    }
    return;
  }

  let prevStart = 0;
  let newStart = 0;
  let loop = true;
  let prevEnd = renderedData.length - 1;
  let newEnd = data.length - 1;
  let a: T;
  let b: T;
  let prevStartNode: Node | null = beforeNode
    ? beforeNode.nextSibling
    : parent.firstChild;
  let newStartNode = prevStartNode;
  let prevEndNode: Node | null = afterNode
    ? afterNode.previousSibling
    : parent.lastChild;

  fixes: while (loop) {
    loop = false;
    let tmpNode: ChildNode | null;

    // Skip prefix
    a = renderedData[prevStart];
    b = data[newStart];
    while (a === b) {
      updateFn(prevStartNode as N, b);
      prevStart++;
      newStart++;
      newStartNode = prevStartNode = prevStartNode!.nextSibling;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = renderedData[prevStart];
      b = data[newStart];
    }

    // Skip suffix
    a = renderedData[prevEnd];
    b = data[newEnd];
    while (a === b) {
      updateFn(prevEndNode as N, b);
      prevEnd--;
      newEnd--;
      afterNode = prevEndNode;
      prevEndNode = prevEndNode!.previousSibling;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = renderedData[prevEnd];
      b = data[newEnd];
    }

    // Fast path to swap backward
    a = renderedData[prevEnd];
    b = data[newStart];
    while (a === b) {
      loop = true;
      updateFn(prevEndNode as N, b);
      tmpNode = prevEndNode!.previousSibling;
      parent.insertBefore(prevEndNode!, newStartNode);
      prevEndNode = tmpNode;
      newStart++;
      prevEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = renderedData[prevEnd];
      b = data[newStart];
    }

    // Fast path to swap forward
    a = renderedData[prevStart];
    b = data[newEnd];
    while (a === b) {
      loop = true;
      updateFn(prevStartNode as N, b);
      tmpNode = prevStartNode!.nextSibling;
      parent.insertBefore(prevStartNode!, afterNode!);
      prevStart++;
      afterNode = prevStartNode;
      prevStartNode = tmpNode;
      newEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = renderedData[prevStart];
      b = data[newEnd];
    }
  }

  // Fast path for shrink
  if (newEnd < newStart) {
    if (prevStart <= prevEnd) {
      let next: ChildNode | null;
      while (prevStart <= prevEnd) {
        if (prevEnd === 0) {
          (prevEndNode as ChildNode).remove();
        } else {
          next = prevEndNode!.previousSibling;
          (prevEndNode as ChildNode).remove();
          prevEndNode = next;
        }
        prevEnd--;
      }
    }
    return;
  }

  // Fast path for add
  if (prevEnd < prevStart) {
    if (newStart <= newEnd) {
      let node: Node;
      const mode = afterNode ? 1 : 0;
      while (newStart <= newEnd) {
        node = createFn(data[newStart]);
        if (mode) {
          parent.insertBefore(node, afterNode!);
        } else {
          parent.appendChild(node);
        }
        newStart++;
      }
    }
    return;
  }

  // Positions for reusing nodes from current DOM state
  const P = new Array<number>(newEnd + 1 - newStart);
  for (let i = newStart; i <= newEnd; i++) P[i] = -1;

  // Index to resolve position from current to new
  const I = new Map();
  for (let i = newStart; i <= newEnd; i++) I.set(data[i], i);

  let reusingNodes = newStart + data.length - 1 - newEnd;
  const toRemove: number[] = [];

  for (let i = prevStart; i <= prevEnd; i++) {
    if (I.has(renderedData[i])) {
      P[I.get(renderedData[i])] = i;
      reusingNodes++;
    } else {
      toRemove.push(i);
    }
  }

  // Fast path for full replace
  if (reusingNodes === 0) {
    if (beforeNode !== undefined || afterNode !== undefined) {
      let node =
        beforeNode === undefined ? parent.firstChild : beforeNode.nextSibling;
      let tmp: ChildNode | null;

      if (afterNode === undefined) afterNode = null;

      while (node !== afterNode) {
        tmp = node!.nextSibling;
        node!.remove();
        node = tmp;
        prevStart++;
      }
    } else {
      parent.textContent = '';
    }

    let node: Node;
    const mode = afterNode ? 1 : 0;
    for (let i = newStart; i <= newEnd; i++) {
      node = createFn(data[i]);
      if (mode) {
        parent.insertBefore(node, afterNode!);
      } else {
        parent.appendChild(node);
      }
    }

    return;
  }

  // What else?
  const longestSeq = longestPositiveIncreasingSubsequence(P, newStart);

  // Collect nodes to work with them
  const nodes: (Node | null)[] = [];
  let tmpC = prevStartNode;
  for (let i = prevStart; i <= prevEnd; i++) {
    nodes[i] = tmpC;
    tmpC = tmpC!.nextSibling;
  }

  for (let i = 0; i < toRemove.length; i++) {
    (nodes[toRemove[i]] as ChildNode).remove();
  }

  let lisIdx = longestSeq.length - 1;
  let tmpD: Node;
  for (let i = newEnd; i >= newStart; i--) {
    if (longestSeq[lisIdx] === i) {
      afterNode = nodes[P[longestSeq[lisIdx]]];
      updateFn(afterNode as N, data[i]);
      lisIdx--;
    } else {
      if (P[i] === -1) {
        tmpD = createFn(data[i]);
      } else {
        tmpD = nodes[P[i]]!;
        updateFn(tmpD as N, data[i]);
      }
      parent.insertBefore(tmpD, afterNode!);
      afterNode = tmpD;
    }
  }
};
