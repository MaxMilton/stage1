import { collect, h } from '../src/browser/runtime';

type TestComponent = HTMLDivElement;

interface TestProps {
  text: string;
}

interface Refs {
  t: Text;
}

const view = h<HTMLDivElement>(`
  <div id=test>
    @t
  </div>
`);

export function Test(props: TestProps): TestComponent {
  const root = view;
  const refs = collect<Refs>(root, view);

  refs.t.nodeValue = props.text;

  return root;
}
