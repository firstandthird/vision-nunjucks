'use strict';
const Nunjucks = require('nunjucks');
const defaults = require('lodash.defaults');

let wrapper = {};
let env = undefined;

wrapper.compile = function (src, options, callback) {
  const asyncCompileMode = (typeof callback === 'function');
  const template = Nunjucks.compile(src, env || options.environment, (Object.hasOwnProperty(options, 'filename') ? options.filename : null));

  if (asyncCompileMode) {
    const renderer = function (context, opts, next) {
      template.render(context, next);
    };

    return callback(null, renderer);
  }

  return function (context) {
    return template.render(context);
  };
};

wrapper.prepare = function (options, next) {
  options.compileOptions.environment = env || Nunjucks.configure(options.path, { watch: false });
  return next();
};

wrapper.configure = function (path, options) {
  if (env) return env;
  env = Nunjucks.configure(path, options || { watch: false });
  return env;
};

wrapper.registerHelper = function (name, helper) {
  helper(function() {
    const e = wrapper.configure(this.server.settings.app.views.path);
    e.addFilter(name, (...args) => {
      this.helper.apply(this, [this.server.root, ...args]);
    }, true);
  });
};

wrapper = defaults(wrapper, Nunjucks);

exports = module.exports = wrapper;
