export type Refs = Record<string, Node>;

export type InferRefs<T> = {
  [K in keyof T]: T[K] extends Node
    ? T[K]
    : /* `never` is more accurate but Node is useful for feedback */ Node;
};

export type LowercaseKeys<T> = {
  [K in keyof T as Lowercase<string & K>]: T[K];
};
