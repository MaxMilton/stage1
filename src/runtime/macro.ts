export interface CompileOptions {
  /**
   * Whether to keep HTML comments in output HTML. When keepComments is true,
   * comments can be used as refs.
   * @default false
   */
  keepComments?: boolean;
  /**
   * Whether to keep spaces adjacent to tags in output HTML. When keepSpaces
   * is false, `<div> x </div>` becomes `<div>x</div>`.
   * @default false
   */
  keepSpaces?: boolean;
}

/**
 * Bun macro which compiles a template string at build-time into a format that
 * can be used by the runtime.
 * @param template - HTML template string.
 * @param options - Compile options.
 */
export async function compile(
  template: string,
  { keepComments, keepSpaces }: CompileOptions = {},
  // @ts-expect-error - Bun macros always result in synchronous inlined data.
): { html: string; k: readonly string[]; d: readonly number[] } {
  const rewriter = new HTMLRewriter();
  const k: string[] = [];
  const d: number[] = [];
  let distance = 0;
  let whitespaceSensitiveBlock = false;
  let root: boolean | undefined;

  rewriter.on('*', {
    element(node) {
      if (!root) {
        if (root === undefined) {
          root = true;
          node.onEndTag(() => {
            root = false;
          });
        } else {
          // eslint-disable-next-line no-console
          console.error(
            'Expected template to have a single root element:',
            template,
          );
        }
      }

      if (node.tagName === 'pre' || node.tagName === 'code') {
        whitespaceSensitiveBlock = true;
        node.onEndTag(() => {
          whitespaceSensitiveBlock = false;
        });
      }
      for (const [name] of node.attributes) {
        if (name[0] === '@') {
          k.push(name.slice(1));
          d.push(distance);
          distance = 0;
          node.removeAttribute(name);
          break;
        }
      }
      distance++;
    },
    // This text handler is invoked twice for each Text node: first with the
    // actual text, then with an empty last chunk. This behaviour stems from
    // the fact that the Response provided to HTMLRewriter.transform() is not
    // streamed; otherwise, there could be multiple chunks before the last one.
    text(chunk) {
      if (!chunk.lastInTextNode) {
        const text = chunk.text.trim();
        if (!text) {
          if (!whitespaceSensitiveBlock) {
            chunk.remove();
          }
          return;
        }
        if (text[0] === '@') {
          k.push(text.slice(1));
          d.push(distance);
          distance = 0;
          // replace with single space which renders a Text node at runtime
          chunk.replace(' ', { html: true });
        } else if (!whitespaceSensitiveBlock) {
          // reduce any whitespace to a single space
          chunk.replace((keepSpaces ? chunk.text : text).replace(/\s+/g, ' '), {
            html: true,
          });
        }
        distance++;
      }
    },
    comments(node) {
      if (keepComments) {
        // TODO: Add documentation that the build/runtime mode also supports
        // using comments as refs. Requires the keepComments option to be true.
        const text = node.text.trim();
        if (text[0] === '@') {
          k.push(text.slice(1));
          d.push(distance);
          distance = 0;
          // TODO: Use empty comment once lol-html supports it (less alloc than node.replace)
          // node.text = '';
          // TODO: use node.replace() once lol-html fixes it for comments
          // node.replace('<!---->', { html: true });
          node.remove();
          node.after('<!---->', { html: true });
        }
        distance++;
      } else {
        node.remove();
      }
    },
  });

  const res = rewriter.transform(new Response(template.trim()));
  const html = await res.text();

  return { html, k, d };
}
