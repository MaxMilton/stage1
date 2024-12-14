import { baseline, bench, group, run } from 'mitata';

const html = `
  <div>
    <p>hello</p>
    <p>world</p>

    <!-- comment -->
    <div>
    <p>hello</p>
    <p>world</p>

    <!-- comment -->
    <!-- comment -->
    <!-- comment -->
    <!-- comment -->
    <!-- comment -->
    <!-- comment -->
    <!-- comment -->
    <div>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>hello</p>
    <p>world</p>
      </div>
    </div>

    <div>
      <p>hello</p>
      <p>world</p>

      <div>
      <p>hello</p>
      <p>world</p>

      <div>
      <!-- comment -->
      <!-- comment -->
      <!-- comment -->
      <!-- comment -->
      <!-- comment -->
      <!-- comment -->
      <!-- comment -->
      <!-- comment -->
      <p>hello</p>
      <p>world</p>
      </div>
      </div>
      </div>
      <div>
      <p>hello</p>
      <p>world</p>

      <!-- comment -->
      <!-- comment -->
      <!-- comment -->
      <!-- comment -->
      <!-- comment -->
      <!-- comment -->
      <div>
        <p>hello</p>
        <p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p><p>world</p>
        <p>world</p>
        <p>world</p>
        <p>world</p>😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼
        <p>world</p>
        <p>world</p>
        <p>world</p>
        <p>world</p>
        <p>world</p>
        <p>world</p>
        <p>world</p>
        😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼        <p>world</p>
        <p>world</p>
        <p>world</p>
        <p>world</p>
        <p>world</p>
        <p>world</p>
YYYYYYYYYYYYYYYYY        <p>world</p>
        <p>world</p>
        <p>world</p>
        <p>world</p>
        <p>world</p>
        <p>world</p>
        <p>world</p>XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
        <p>world</p>
        <p>world</p>
        <p>world</p>
        😼       <p>world</p>

        <div>
😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼😼          <p>hello</p>
          <p>world</p>
        </div>
      </div>

      <div>
        <p>hello</p>
        <p>world</p>

        <div>
          <p>hello</p>
          <p>world</p>

          <div>
            <p>hello</p>
            <p>world</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

const base = () => '';

function one(template: string) {
  return (
    template
      // reduce any whitespace to a single space
      .replace(/\s+/g, ' ')
      // remove space adjacent to tags
      .replace(/> /g, '>')
      .replace(/ </g, '<')
  );
}

function two(template: string) {
  return (
    template
      // reduce any whitespace to a single space
      .replaceAll(/\s+/g, ' ')
      // remove space adjacent to tags
      .replaceAll(/> /g, '>')
      .replaceAll(/ </g, '<')
  );
}

function twoS1(template: string) {
  return (
    template
      // reduce any whitespace to a single space
      .replaceAll(/\s+/g, ' ')
      // remove space adjacent to tags
      .replaceAll('> ', '>')
      .replaceAll(' <', '<')
  );
}
function twoS2(template: string) {
  return (
    template
      // reduce any whitespace to a single space
      .replace(/\s+/g, ' ')
      // remove space adjacent to tags
      .replaceAll('> ', '>')
      .replaceAll(' <', '<')
  );
}

function oneB() {
  return (
    html
      // reduce any whitespace to a single space
      .replace(/\s+/g, ' ')
      // remove space adjacent to tags
      .replace(/> /g, '>')
      .replace(/ </g, '<')
  );
}

function twoB() {
  return (
    html
      // reduce any whitespace to a single space
      .replaceAll(/\s+/g, ' ')
      // remove space adjacent to tags
      .replaceAll(/> /g, '>')
      .replaceAll(/ </g, '<')
  );
}

const oneC = (template: string) =>
  template
    // reduce any whitespace to a single space
    .replace(/\s+/g, ' ')
    // remove space adjacent to tags
    .replace(/> /g, '>')
    .replace(/ </g, '<');

const twoC = (template: string) =>
  template
    // reduce any whitespace to a single space
    .replaceAll(/\s+/g, ' ')
    // remove space adjacent to tags
    .replaceAll(/> /g, '>')
    .replaceAll(/ </g, '<');

const oneD = () =>
  html
    // reduce any whitespace to a single space
    .replace(/\s+/g, ' ')
    // remove space adjacent to tags
    .replace(/> /g, '>')
    .replace(/ </g, '<');

const twoD = () =>
  html
    // reduce any whitespace to a single space
    .replaceAll(/\s+/g, ' ')
    // remove space adjacent to tags
    .replaceAll(/> /g, '>')
    .replaceAll(/ </g, '<');

group('input from fn arg', () => {
  baseline('baseline', base);
  bench('one:replace', () => one(html));
  bench('two:replaceAll', () => two(html));
  bench('twoS1:replaceAll,string', () => twoS1(html));
  bench('twoS2:combo,string', () => twoS2(html));
  bench('oneB:replace', () => oneB());
  bench('twoB:replaceAll', () => twoB());
  bench('oneC:replace,arrow', () => oneC(html));
  bench('twoC:replaceAll,arrow', () => twoC(html));
});

group('input from global var', () => {
  baseline('baseline', base);
  bench('oneB2:replace', oneB);
  bench('twoB2:replaceAll', twoB);
  bench('oneD:replace,arrow', oneD);
  bench('twoD:replaceAll,arrow', twoD);
});

// console.log('#### SAME', one(html) === two(html));
// console.log('#########', one(html));

const out = await run();
// await run({ collect: true });
console.log(out);
