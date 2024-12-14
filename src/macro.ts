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
export function compile(
  template: string,
  { keepComments, keepSpaces }: CompileOptions = {},
): { html: string; k: readonly string[]; d: readonly number[] } {
  const k: string[] = [];
  const d: number[] = [];
  let distance = 0;
  let whitespaceSensitiveBlock = false;
  let root: boolean | undefined;

  const html = new HTMLRewriter()
    .onDocument({
      comments(node) {
        if (keepComments) {
          // TODO: Add documentation that precompiled mode supports using
          // comments as refs. Requires the keepComments option to be true.
          const text = node.text.trim();
          if (text[0] === '@') {
            k.push(text.slice(1));
            d.push(distance);
            distance = 0;
            // TODO: use node.replace() once lol-html fixes it for comments
            // node.replace('<!-->', { html: true });
            node.remove();
            node.after('<!-->', { html: true });
          }
          distance++;
        } else {
          node.remove();
        }
      },
    })
    .on('*', {
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
      // the fact that the data provided to HTMLRewriter.transform() can be
      // streamed; where the last empty chunk signals the end of the text.
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
            chunk.replace(
              (keepSpaces ? chunk.text : text).replace(/\s+/g, ' '),
              { html: true },
            );
          }
          distance++;
        }
      },
    })
    .transform(template.trim());

  return { html, k, d };
}
