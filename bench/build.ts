/* eslint-disable no-console */
export {};

// TODO: Easy way to build a single benchmark test case for running in the browser.

console.time('build');
const out = await Bun.build({
  entrypoints: ['src/temp.ts'],
  outdir: 'dist',
  target: 'browser',
  minify: true,
});
console.timeEnd('build');
console.log(out);
