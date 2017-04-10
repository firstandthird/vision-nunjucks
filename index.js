'use strict';
const Nunjucks = require('nunjucks');
const defaults = require('lodash.defaults');

let wrapper = {};
let env = undefined;
let compileMode = null;
const helpers = [];

wrapper.compile = function (src, options, callback) {
  const asyncCompileMode = (typeof callback === 'function');
  const filename = Object.hasOwnProperty(options, 'filename') ? options.filename : null;
  const template = Nunjucks.compile(src, env, filename);

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
  compileMode = options.compileMode;
  const config = Object.assign({ watch: false }, options.compileOptions);
  env = Nunjucks.configure(options.path, config);
  helpers.forEach((helper) => {
    env.addFilter(helper.name, helper.fn, (compileMode !== 'sync'));
  });
  return next();
};

wrapper.registerHelper = function (name, helper) {
  helpers.push({ name, fn: helper });
};

wrapper = defaults(wrapper, Nunjucks);

exports = module.exports = wrapper;
