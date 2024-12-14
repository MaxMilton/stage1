import { createBundle } from 'dts-buddy';
import { rollup } from 'rollup';
import { minify } from 'terser';

console.time('prebuild');
await Bun.$`rm -rf dist`;
console.timeEnd('prebuild');

console.time('build1');

const out1 = await Bun.build({
  entrypoints: ['src/browser/index.ts'],
  outdir: 'dist',
  naming: '[dir]/browser.js',
  target: 'browser',
  minify: true,
  sourcemap: 'inline',
});
if (!out1.success) throw new AggregateError(out1.logs, 'Build failed');

// Also use rollup + terser because they generate IIFE code much better than Bun
const bundle = await rollup({
  input: out1.outputs[0].path,
});
await bundle.write({
  file: out1.outputs[0].path,
  format: 'iife', // must not mutate global scope
  name: 'stage1',
  sourcemap: true,
  plugins: [
    // @ts-expect-error - TODO: Fix return types
    {
      name: 'terser',
      renderChunk(src) {
        return minify(src, {
          ecma: 2015,
          sourceMap: true,
          compress: {
            comparisons: false,
            negate_iife: false,
            reduce_funcs: false, // prevent function inlining
            passes: 2,
          },
          format: {
            wrap_func_args: true,
            wrap_iife: true,
          },
        });
      },
    },
  ],
});

console.timeEnd('build1');
console.time('build2');

const out2 = await Bun.build({
  entrypoints: ['src/browser/index.ts'],
  outdir: 'dist',
  target: 'browser',
  naming: '[dir]/browser.mjs',
  minify: true,
  sourcemap: 'linked',
});
if (!out2.success) throw new AggregateError(out2.logs, 'Build failed');

const out3 = await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'browser',
  minify: true,
  sourcemap: 'linked',
});
if (!out3.success) throw new AggregateError(out3.logs, 'Build failed');

const out4 = await Bun.build({
  entrypoints: ['src/macro.ts'],
  outdir: 'dist',
  target: 'bun',
  minify: true,
  sourcemap: 'linked',
});
if (!out4.success) throw new AggregateError(out4.logs, 'Build failed');

const out5 = await Bun.build({
  entrypoints: [
    'src/reconcile/keyed.ts',
    'src/reconcile/non-keyed.ts',
    'src/reconcile/reuse-nodes.ts',
  ],
  outdir: 'dist/reconcile',
  target: 'browser',
  minify: true,
  sourcemap: 'linked',
});
if (!out5.success) throw new AggregateError(out5.logs, 'Build failed');

console.timeEnd('build2');
console.time('dts');

await createBundle({
  output: 'dist/index.d.ts',
  modules: {
    stage1: 'src/index.ts',
    'stage1/browser': 'src/browser/index.ts',
    'stage1/macro': 'src/macro.ts',
    'stage1/reconcile/keyed': 'src/reconcile/keyed.ts',
    'stage1/reconcile/non-keyed': 'src/reconcile/non-keyed.ts',
    'stage1/reconcile/reuse-nodes': 'src/reconcile/reuse-nodes.ts',
  },
  include: ['src'],
});

console.timeEnd('dts');
