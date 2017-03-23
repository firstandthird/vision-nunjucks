'use strict';
const tap = require('tap');
const fs = require('fs');
const visionNunjucks = require('../');
const Hapi = require('hapi');

let server;
tap.beforeEach((done) => {
  server = new Hapi.Server();
  server.connection();

  server.register(require('vision'), (err) => {
    if (err) {
      return done(err);
    }
    done();
  });
});
tap.test('render sync', (test) => {
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
  server.inject({
    url: '/'
  }, (res) => {
    test.equal(res.statusCode, 200);
    const expected = fs.readFileSync(`${__dirname}/expected/test.html`, 'utf8');
    test.equal(res.payload.toString(), expected.toString());
    test.end();
  });
});

tap.test('render async', (test) => {
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
  server.inject({
    url: '/'
  }, (res) => {
    test.equal(res.statusCode, 200);
    const expected = fs.readFileSync(`${__dirname}/expected/test.html`, 'utf8');
    test.equal(res.payload.toString(), expected.toString());
    test.end();
  });
});

tap.test('manually add helper', (test) => {
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
  server.inject({
    url: '/'
  }, (res) => {
    test.equal(res.statusCode, 200);
    const expected = fs.readFileSync(`${__dirname}/expected/test.html`, 'utf8');
    test.equal(res.payload.toString(), expected.toString());
    test.end();
  });
});
