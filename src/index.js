const stylelint = require('stylelint');

const ruleName = 'thomaspaillot/enforce-variable';
const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: property => `Expected variable for ${property}.`
});

const backgroundValueRegex = /(top|left|center|bottom|right|\d+(\w+|%))*(repeat|no-repeat)?(url\(.+\))?/g;
const borderValuRegex = /(\d+.?\w+)?(none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset|initial|inherit)?/g;

const parseBackgroundValue = value => value.replace(backgroundValueRegex, '').trim();
const parseBorderValue = value => value.replace(borderValuRegex, '').trim();

const isValueAcceptedForProperty = (val, property = '', exceptions = null) => {
  const regEx = /^(\$)|(map-get)|(@)|(var)/;
  let passExceptionsRegEx = false;
  let value = val;

  if (/^border(-(top|right|bottom|left))?$/.test(property) && val.split(' ').length > 1) {
    value = parseBorderValue(val);
  } else if (property === 'background') {
    value = parseBackgroundValue(val);
  }

  if (exceptions) {
    const exceptionsRegEx = new RegExp(exceptions.slice(1, -1));
    passExceptionsRegEx = value
      .split(' ')
      .map(v => exceptionsRegEx.test(v))
      .every(v => v);
  }

  const passRegEx = value
    .split(/\s(?!'|")/)
    .map(v => regEx.test(v))
    .every(v => v);

  return passRegEx || passExceptionsRegEx;
};

const isPropertyChecked = (prop, targetProperties) => {
  if (targetProperties) {
    return new RegExp(targetProperties.slice(1, -1)).test(prop);
  }

  return false;
};

module.exports = stylelint.createPlugin(ruleName, options => (root, result) => {
  const validOptions = stylelint.utils.validateOptions({
    ruleName,
    result,
    actual: options
  });

  if (!validOptions) {
    return;
  }

  root.walkDecls(node => {
    if (
      isPropertyChecked(node.prop, options.properties) &&
      !isValueAcceptedForProperty(node.value, node.prop, options.exceptionValues)
    ) {
      stylelint.utils.report({
        ruleName,
        result,
        node,
        message: messages.expected(node.prop)
      });
    }
  });
});

module.exports.ruleName = ruleName;
module.exports.messages = messages;
module.exports.isValueAcceptedForProperty = isValueAcceptedForProperty;
module.exports.isPropertyChecked = isPropertyChecked;
