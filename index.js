'use strict';
const Nunjucks = require('nunjucks');
/* eslint-disable no-underscore-dangle */
const defaults = require('lodash.defaults');

let wrapper = {};
let _env = undefined;
let compileMode = null;
const helpers = [];

wrapper.compile = function (src, options, callback) {
  const asyncCompileMode = (typeof callback === 'function');
  const filename = Object.hasOwnProperty(options, 'filename') ? options.filename : null;
  const template = Nunjucks.compile(src, _env, filename);
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

wrapper.clearEnvironment = function() {
  _env = null;
};

wrapper.initEnvironment = function(path, compileOptions) {
  if (_env) {
    return _env;
  }
  const config = Object.assign({ watch: false }, compileOptions);
  _env = Nunjucks.configure(path, config);
  return _env;
};

wrapper.prepare = function (options, next) {
  compileMode = options.compileMode;
  const env = wrapper.initEnvironment(options.path, options.compileOptions);

  helpers.forEach((helper) => {
    env.addFilter(helper.name, helper.fn, (compileMode !== 'sync'));
  });
  return next();
};

wrapper.registerHelper = function (name, helper) {
  if (_env) {
    _env.addFilter(name, helper, (compileMode !== 'sync'));
    return;
  }

  const duplicatedHelper = helpers.some(registeredHelper => (registeredHelper.name === name));

  if (duplicatedHelper) return;

  helpers.push({ name, fn: helper });
};

wrapper = defaults(wrapper, Nunjucks);

exports = module.exports = wrapper;
