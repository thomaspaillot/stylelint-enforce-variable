# stylelint-enforce-variable

[![Build Status](https://travis-ci.org/thomaspaillot/stylelint-enforce-variable.svg?branch=master)](https://travis-ci.org/thomaspaillot/stylelint-enforce-variable) [![codecov](https://codecov.io/gh/thomaspaillot/stylelint-enforce-variable/branch/master/graph/badge.svg)](https://codecov.io/gh/thomaspaillot/stylelint-enforce-variable)

A [stylelint](https://github.com/stylelint/stylelint) plugin that enforces variables use for specified properties. Variables could be scss, less or custom css variable ($, map-get(), @ or var(--name) is supported). Shorthand declaration is also supported, declaration like "border: 1px solid var(--blue);" or "margin: $ws-s $ws-l;" will be checked.

## Installation

```
npm install stylelint-enforce-variable --save-Dev
```

## Usage

Add it to your stylelint config `plugins` array, then add `"enforce-variable"` to your rules, specifying the properties for which you want to enforce variables use (with a Regex) and some exception values (with a Regex too).

Like so:

```js
// .stylelintrc
{
  "plugins": [
    "stylelint-enforce-variable"
  ],
  "rules": {
    // ...
    "thomaspaillot/enforce-variable": ["/^color$/", {
      "exceptionValues": "/^(none|transparent)$/"
    }
    // ...
  }
}
```

### Options

#### Properties

Properties option is required and as no default value, so you should provide a Regex that will match all properties for which you want to enforce variable use

```js
['/^background(-color)?$/']
```

This will match background and background-color properties but not background-size or background-position.

```js
['/^(background(-color)?|color|fill|stroke|border((-top|-left|-right|-bottom)?(-color)?)?)$/']
```

This will match all color related properties.

#### Exception values

Exception values option is optional and as no default value, you could provide a Regex that will match all non-variable values you want to accept.

```js
[
  '/^background(-color)?$/',
  {
    exceptionValues: '/^(transparent|0|none)$/'
  }
]
```

This will accept transparent, none or 0 value for the specified properties.
