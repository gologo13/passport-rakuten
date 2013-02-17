var vow = require('vows');
var assert = require('assert');
var util = require('util');
var passport_rakuten = require('passport-rakuten');

vow.describe('passport-rakuten').addBatch({
  'module': {
    'should report a version': function (x) {
      assert.isString(passport_rakuten.version);
    },
  },
}).export(module);
