const tap = require('tap');
const fs = require('fs');
const visionNunjucks = require('../');
const Hapi = require('@hapi/hapi');

let server;
tap.beforeEach(async() => {
  visionNunjucks.clearEnvironment();
  server = new Hapi.Server();
  await server.register(require('vision'));
});

tap.test('render sync', async(test) => {
  server.views({
    engines: {
      njk: visionNunjucks
    },
    path: `${__dirname}/views`,
    helpersPath: `${__dirname}/helpers`
  });
  server.route({
    path: '/',
    method: 'get',
    handler: {
      view: {
        template: 'test',
        context: {},
      }
    }
  });
  try {
    const res = await server.inject({ url: '/' });
    test.equal(res.statusCode, 200);
    const expected = fs.readFileSync(`${__dirname}/expected/test.html`, 'utf8');
    test.equal(res.payload.toString(), expected.toString());
  } catch (e) {
    test.fail();
  } finally {
    test.end();
  }
});

tap.test('render async', async(test) => {
  server.views({
    engines: {
      njk: visionNunjucks
    },
    path: `${__dirname}/views`,
    helpersPath: `${__dirname}/helpers`,
    compileMode: 'async'
  });
  server.route({
    path: '/',
    method: 'get',
    handler: {
      view: {
        template: 'test-async'
      }
    }
  });
  const res = await server.inject({
    url: '/'
  });
  test.equal(res.statusCode, 200);
  const expected = fs.readFileSync(`${__dirname}/expected/test.html`, 'utf8');
  test.equal(res.payload.toString(), expected.toString());
  test.end();
});

tap.test('manually add helper', async(test) => {
  const viewManager = server.views({
    engines: {
      njk: visionNunjucks
    },
    path: `${__dirname}/views`,
    compileMode: 'async'
  });
  server.route({
    path: '/',
    method: 'get',
    handler: {
      view: {
        template: 'test-async'
      }
    }
  });
  viewManager.registerHelper('test', (str) => `${str} from test`);
  const res = await server.inject({
    url: '/'
  });
  test.equal(res.statusCode, 200);
  const expected = fs.readFileSync(`${__dirname}/expected/test.html`, 'utf8');
  test.equal(res.payload.toString(), expected.toString());
  test.end();
});

tap.test('compileOptions', async(test) => {
  server.views({
    engines: {
      njk: visionNunjucks
    },
    path: `${__dirname}/views`,
    compileOptions: {
      throwOnUndefined: true
    }
  });
  server.route({
    path: '/',
    method: 'get',
    handler: {
      view: {
        template: 'test-compileopts'
      }
    }
  });
  try {
    await server.inject({ url: '/' });
  } catch (e) {
    test.notEqual(e, null);
    test.end();
  }
});

tap.test('Log errors w/ details', async(test) => {
  server.views({
    engines: {
      njk: visionNunjucks
    },
    path: `${__dirname}/views`,
    helpersPath: `${__dirname}/helpers`
  });
  server.route({
    path: '/',
    method: 'get',
    handler: {
      view: {
        template: 'error',
        context: {
          exist: null
        },
      }
    }
  });
  const originalConsoleError = console.error;
  let count = 0;

  try {
    console.error = (...args) => {
      const [tags, data] = args;
      console.log(tags);
      if (Array.isArray(tags) && tags.includes('nunjucks')) {
        test.ok(tags.includes('error'), 'Tags include error');
        test.type(data, 'object', 'Data is an object');
        test.ok(data.hasOwnProperty('originalError'), 'Data has the original error');
        test.ok(data.hasOwnProperty('options'), 'Data has an options object');
        test.ok(data.hasOwnProperty('message'), 'Data has a message');
        count++;
      } else {
        originalConsoleError(...args);
      }
    }

    const res = await server.inject({ url: '/' });
    test.equal(res.statusCode, 500);
    test.notEqual(count, 0, 'Console.error has run');
  } catch (e) {
    test.fail();
  } finally {
    console.error = originalConsoleError;
    test.end();
  }
});
