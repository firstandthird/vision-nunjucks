# vision-nunjucks

[Nunjucks](https://mozilla.github.io/nunjucks/) rendering language support for [vision](https://github.com/hapijs/vision)

Vision Nunjucks also has built in support for the  [clientkit](https://github.com/firstandthird/clientkit) UI Framework.

## Installation

```
npm install vision-nunjucks
```

## Basic Usage
```js
await server.register(require('vision'));

server.views({
  engines: {
    njk: require('vision-nunjucks')
  },
  path: '/views'
});
```

Now you can specify template-rendering routes just with
```js
server.route({
  path: '/',
  method: 'get',
  handler: {
    view: {
      template: 'test',
      context: {
        meal1: 'Breakfast',
        meal2: 'Second Breakfast'
      },
    }
  }
});
```

## Helpers

   Helpers are functions that will be registered as Nunjucks filters. You can manually register helpers like so:

```js
const viewManager = server.views({
  engines: {
    njk: visionNunjucks
  },
  path: `${__dirname}/views`
});
viewManager.registerHelper('myHelper', (str) => `${str} from test`);
```

Then in your Nunjucks templates you can do:
```html
<p>{{ "hi" | myHelper }}</p>
```

and get back:

```html
<p>hi from test</p>
```

## Asynchronous Helpers

By default vision-nunjucks assumes your helpers are synchronous, but you can also have it invoke helpers in the asynchronous style:

```js
server.views({
  engines: {
    njk: require('vision-nunjucks')
  },
  path: '/views',
  compileMode: 'async'
});
```

Your helpers should then have the form:
```js
module.exports = function(str, done) {
  done(null, `${str} is a `);
};
```

## Compile Options

You can pass additional nunjucks compile options like so:

```js
server.views({
  engines: {
    njk: require('vision-nunjucks')
  },
  path: '/views',
  compileOptions: {
    throwOnUndefined: true
  }
});
```

## Exported Functions:

vision-nunjucks exports all of the default functions in [Nunjucks](https://mozilla.github.io/nunjucks/api.html), and additionally provides the following wrapper functions to facilitate using Nunjucks:

- __compile(src, options, callback)__

  A frontend for [Nunjucks.compile](https://mozilla.github.io/nunjucks/api.html#compile).  Will take in the string source code for a template and return a render function that takes in a context object and renders the template with that context. _options_ can include a _filename_ field that will be passed as the _path_ option for _Nunjucks.compile_. vision-nunjucks will manage the env parameter for you.

- __initEnvironment(path, compileOptions)__

  Frontend for the [Nunjucks.configure](https://mozilla.github.io/nunjucks/api.html#configure). _compileOptions_ will be passed to the _opt_ field.  Will return the _env_ object if you need access to it, but you can ignore it and vision-nunjucks will manage it for you.

- __clearEnvironment()__

  Resets the managed env parameter.

- __prepare(options, next)__

  Will call _initEnvironment_ and register helpers.  The _options_ object can contain:

  - _compileMode_

    Set to 'sync' or 'async' to have synchronous / asynchronous helpers.

  - _path_

    Will be passed as the path parameter to _initEnvironment_.

  - _compileOptions_

    Will be passed as the _compileOptions_ to _initEnvironment_.

- __registerHelper(name, helper)__

  Takes in the name and function for a helper and then registers it in the managed environment.  Calling _initEnvironment_ will purge these from the environment.
