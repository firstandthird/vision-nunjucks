const tap = require('tap');
const fs = require('fs');
const visionNunjucks = require('../');
const Hapi = require('hapi');

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
        template: 'test'
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
/*
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
  const res = await server.inject({
    url: '/'
  });
  test.equal(res.statusCode, 500);
  test.end();
});
*/
