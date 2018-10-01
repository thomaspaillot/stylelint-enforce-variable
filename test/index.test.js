const test = require('tape');
const stylelint = require('stylelint');
const testRule = require('stylelint-test-rule-tape');
const { isPropertyChecked, isValueAcceptedForProperty, ruleName, rule } = require('../src');

test('isPropertyChecked', t => {
  t.test('should return true for color prop with /color/ regex', tt => {
    tt.plan(1);
    tt.equal(isPropertyChecked('color', '/color/'), true);
  });

  t.test('should return true for color prop with /^color|border/ regex', tt => {
    tt.plan(1);
    tt.equal(isPropertyChecked('color', '/^color|border/'), true);
  });

  t.test('should return true for border prop with /^color|border/ regex', tt => {
    tt.plan(1);
    tt.equal(isPropertyChecked('border', '/^color|border/'), true);
  });

  t.test('should return false if there’s no target', tt => {
    tt.plan(1);
    tt.equal(isPropertyChecked('color'), false);
  });
});

test('isValueAcceptedForProperty', t => {
  t.test('should not accept non-variable values', tt => {
    tt.plan(3);
    tt.equal(isValueAcceptedForProperty('#fff'), false);
    tt.equal(isValueAcceptedForProperty('blue'), false);
    tt.equal(isValueAcceptedForProperty('rgb(10, 20, 10)'), false);
  });

  t.test('should not accept non variable values for shorthand border properties', tt => {
    tt.plan(5);
    tt.equal(isValueAcceptedForProperty('1px dotted rgb(10, 20, 10)', 'border'), false);
    tt.equal(isValueAcceptedForProperty('solid 3px white', 'border-top'), false);
    tt.equal(isValueAcceptedForProperty('solid 3px #ccc', 'border-bottom'), false);
    tt.equal(isValueAcceptedForProperty('dotted 2px green', 'border-left'), false);
    tt.equal(isValueAcceptedForProperty('0.5px dashed #ffccaa', 'border-right'), false);
  });

  t.test('should not accept non variable values for shorthand margin property', tt => {
    tt.plan(3);
    tt.equal(isValueAcceptedForProperty('3px', 'margin'), false);
    tt.equal(isValueAcceptedForProperty('0 10px', 'margin'), false);
    tt.equal(isValueAcceptedForProperty('5px $ws-s 10px', 'margin'), false);
  });

  t.test('should not accept non variable values for shorthand background property', tt => {
    tt.plan(2);
    tt.equal(
      isValueAcceptedForProperty('red url(../images/bg.jpg) left top no-repeat', 'background'),
      false
    );
    tt.equal(
      isValueAcceptedForProperty('#333 url(../images/bg.jpg) center repeat', 'background'),
      false
    );
  });

  t.test('should accept variable values', tt => {
    tt.plan(4);
    tt.equal(isValueAcceptedForProperty('$blue'), true);
    tt.equal(isValueAcceptedForProperty('@blue'), true);
    tt.equal(isValueAcceptedForProperty('var(--blue)'), true);
    tt.equal(isValueAcceptedForProperty('map-get($map, "blue")'), true);
  });

  t.test('should accept variable values for shorthand border properties', tt => {
    tt.plan(5);
    tt.equal(isValueAcceptedForProperty('1px solid $blue', 'border'), true);
    tt.equal(isValueAcceptedForProperty('3px dotted @blue', 'border-top'), true);
    tt.equal(isValueAcceptedForProperty('0.5px solid var(--blue)', 'border-bottom'), true);
    tt.equal(isValueAcceptedForProperty('1px solid map-get($map, "blue")', 'border-left'), true);
    tt.equal(isValueAcceptedForProperty('1px solid $red-dark', 'border-right'), true);
  });

  t.test('should accept variable values for shorthand margin property', tt => {
    tt.plan(8);
    tt.equal(isValueAcceptedForProperty('$ws-s', 'margin'), true);
    tt.equal(isValueAcceptedForProperty('$ws-s $ws-l', 'margin'), true);
    tt.equal(isValueAcceptedForProperty('$ws-s $ws-l $ws-xs', 'margin'), true);
    tt.equal(isValueAcceptedForProperty('$ws-s $ws-xs $ws-s $ws-xs', 'margin'), true);
    tt.equal(isValueAcceptedForProperty('var(--ws-s)', 'margin'), true);
    tt.equal(isValueAcceptedForProperty('var(--ws-s) var(--ws-l)', 'margin'), true);
    tt.equal(isValueAcceptedForProperty('var(--ws-s) var(--ws-l) var(--ws-xs)', 'margin'), true);
    tt.equal(
      isValueAcceptedForProperty('var(--ws-s) var(--ws-xs) var(--ws-s) var(--ws-xs)', 'margin'),
      true
    );
  });

  t.test('should accept variable values for shorthand border-color property', tt => {
    tt.plan(1);
    tt.equal(isValueAcceptedForProperty('$blue var(--red) var(--blue)', 'border-color'), true);
  });

  t.test('should accept variable values for shorthand border-radius property', tt => {
    tt.plan(1);
    tt.equal(isValueAcceptedForProperty('$small $big', 'border-color'), true);
  });

  t.test('should accept variable values for shorthand background property', tt => {
    tt.plan(2);
    tt.equal(
      isValueAcceptedForProperty('$blue url("../images/bg.png") top left no-repeat', 'background'),
      true
    );
    tt.equal(
      isValueAcceptedForProperty('var(--blue) url("../images/bg.png") center repeat', 'background'),
      true
    );
  });

  t.test('should accept exceptions value for all properties', tt => {
    tt.plan(2);
    tt.equal(
      isValueAcceptedForProperty('transparent', 'background-color', '/^(transparent)|(none)/'),
      true
    );
    tt.equal(isValueAcceptedForProperty('none', 'border', '/^(transparent)|(none)/'), true);
  });
});

testRule(rule, {
  ruleName,
  config: [
    '/^color|border/',
    {
      exceptionValues: '/^(transparent)|(none)/'
    }
  ],
  skipBasicChecks: true,

  accept: [
    { code: '.rule { color: $blue; }' },
    { code: '.rule { color: var(--blue); }' },
    { code: '.rule { border-color: @blue; }' },
    { code: '.rule { border-bottom-color: transparent; }' },
    { code: '.rule { border: 1px solid var(--blue); }' }
  ],

  reject: [
    {
      code: '.rule { color: blue; }',
      message: `Expected variable for color. (${ruleName})`
    },
    {
      code: '.rule { border-color: blue; }',
      message: `Expected variable for border-color. (${ruleName})`
    }
  ]
});

test('incorrect parameters', t => {
  t.test('should display error on incorrect properties argument', tt => {
    const rules = {
      [ruleName]: ['color']
    };
    const code = `div {}`;
    const options = {
      code,
      configBasedir: __dirname,
      config: {
        plugins: ['../src'],
        rules
      }
    };
    return stylelint.lint(options).then(result => {
      tt.equal(result.errored, true);
      tt.end();
    });
  });

  t.test('should display error on incorrect exception values argument', tt => {
    const rules = {
      [ruleName]: ['/color/', { exceptionValues: 'none' }]
    };
    const code = `div {}`;
    const options = {
      code,
      configBasedir: __dirname,
      config: {
        plugins: ['../src'],
        rules
      }
    };
    return stylelint.lint(options).then(result => {
      tt.equal(result.errored, true);
      tt.end();
    });
  });
});
