[![Build status](https://img.shields.io/github/actions/workflow/status/maxmilton/stage1/ci.yml?branch=master)](https://github.com/maxmilton/stage1/actions)
[![Coverage status](https://img.shields.io/codeclimate/coverage/maxmilton/stage1)](https://codeclimate.com/github/maxmilton/stage1)
[![NPM version](https://img.shields.io/npm/v/stage1.svg)](https://www.npmjs.com/package/stage1)
[![NPM bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/stage1.svg)](https://bundlephobia.com/result?p=stage1)
[![Licence](https://img.shields.io/github/license/maxmilton/stage1.svg)](https://github.com/maxmilton/stage1/blob/master/LICENSE)

# stage1

High-performance JavaScript micro framework.

> Warning: This is alpha software. Test thoroughly before using in production. Please report any bugs you find!

Originally a fork of the excellent <https://github.com/Freak613/stage0> project.

## TODO

- Add documentation about:
  - Internal use of `innerHTML` — potential risk of XSS etc.; never use `h` and `html` functions with untrusted input
    - In future we may have `Sanitizer.sanitizeFor(...)` which could be used to sanitize untrusted input
      - It's unlikely we'll use it internally due to performance overhead but developers should definitely sanitize input when untrusted before passing it in... although we could create light wrapper functions
      - <https://developer.mozilla.org/en-US/docs/Web/API/Sanitizer/sanitizeFor>
      - <https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API>
  - New DOM utility functions
    - `fragment`
    - `text`
    - `create`
    - `clone`
    - `append`
    - `prepend`
    - `insert`
    - `onRemove`
  - New reactive store feature
  - Differences from the original `stage0` project:
    - There are now 2 runtime modes:
      - New precompiled runtime mode for ultimate performance. Compiles templates at build-time via a bun macro that minifies templates, generates metadata, and then includes minimal runtime code in your JS bundle. Currently only works with [Bun.build](https://bun.sh/docs/bundler).
      - The regular mode is still available which generates metadata when your JS is run in the browser. Regular mode can be used with or without a build process.
    - Ref nodes are now marked with `@` rather than `#`
    - `h` is now `function h(template: string): S1Node` e.g., `h('<p>@key<p>')`
    - `html` is available to use as a string template literal tag function e.g., `` html`<p>@key<p>` `` (regular mode only)
    - `view.collect` is now a `collect` function that needs to be imported separately
    - Extra DOM utils
    - New reactive `store` factory can be imported from `stage1/store`
    - Improved TypeScript support
    - Reduced size and improved load and runtime performance
    - Import paths:
      - Other than reconcilers and the store, everything is a named export from `stage1`
      - Reconcilers all export a `reconcile` function
      - `/keyed` --> `/reconcile/keyed`
      - `/reconcile` --> `/reconcile/non-keyed`
      - `/reuse-nodes` --> `/reconcile/reuse-nodes`
  - Ref names must be lowercase because some browsers normalise element attribute names when rendering HTML
- Add API and usage documentation
  - The regular mode `h()` function does not support skipping minification in whitespace sensitive HTML blocks like `<pre>` and `<code>` because it would be too slow. The precompiled mode `compile()` macro does however. Same for the other compile options.
- Add more tests
- Add examples
- Set up benchmarking + compare to `stage0` and other JS frameworks
- Submit to <https://github.com/krausest/js-framework-benchmark>

## Browser support

> Note: Internet Explorer is not supported.

Minimum browser version required:

<!-- Note: The limiting factor is use of <template> element. -->

- Chrome 26
- Edge 13
- Firefox 22
- Safari 8
- Opera 15

Some optional features require a higher browser version:

- `html` tagged template literal function uses `String.raw`; [requirements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw#browser_compatibility)
- `onRemove` utility function uses `for...of` and `MutationObserver`; [requirements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of#browser_compatibility), [requirements](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/)
- `store` uses `Proxy`; [requirements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy#browser_compatibility)
  - Also uses [logical nullish assignment](<(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_nullish_assignment#browser_compatibility)>) and [optional chaining operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining#browser_compatibility), however, build tools can transform these for old browser targets

SSR (server-side rendering) is not supported and is not the intended use of this library.

## Build environment JS runtime support

The default runtime requires [bun](https://bun.sh/) version 1.0.20 or above.

The browser bundle does not have any specific build requirements.

## Bugs

Please report any bugs you encounter on the [GitHub issue tracker](https://github.com/maxmilton/stage1/issues).

## Changelog

See [releases on GitHub](https://github.com/maxmilton/stage1/releases).

## License

MIT license. See [LICENSE](https://github.com/maxmilton/stage1/blob/master/LICENSE).

---

© 2024 [Max Milton](https://maxmilton.com)
