var vows   = require('vows')
  , assert = require('assert')
  , util   = require('util')
  , url    = require('url');
var RakutenStrategy = require('passport-rakuten/strategy')
  , Config = require('../config');

// constant
var PROFILE_PAGE = 'https://app.rakuten.co.jp/services/api/FavoriteBookmark/List/20120627?'

// dummy data
var CLIENT_ID     = Config.client_id;
var CLIENT_SECRET = Config.client_secret;
var REDIRECT_URI  = Config.redirect_uri;
var ACCESS_TOKEN  = Config.access_token;

// test cases
vows.describe('RakutenStrategy').addBatch({
  'strategy': {
    topic: function() {
      return new RakutenStrategy({
          clientID    : CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          redirectURL : REDIRECT_URI,
          scope : "openid"
      },
      function() {});
    },

    'should be named rakuten': function (strategy) {
      assert.equal(strategy.name, 'rakuten');
    },
  },

  'strategy when redirecting for authorization': {
    topic: function () {
      var strategy = new RakutenStrategy({
          clientID    : CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          redirectURL : REDIRECT_URI,
          scope : "openid"
      });
      return strategy;
    },

    'and display not set': {
      topic: function (strategy) {
        var mockRequest = {},
            url;

        // Stub strategy.redirect()
        var self = this;
        strategy.redirect = function (location) {
          self.callback(null, location)
        };
        strategy.authenticate(mockRequest);
      },

      'does not set authorization param': function(err, location) {
        var params = url.parse(location, true).query;
        assert.isUndefined(params.display);
      }
    },

    'and display set to mobile': {
      topic: function (strategy) {
        var mockRequest = {},
            url;

        // Stub strategy.redirect()
        var self = this;
        strategy.redirect = function (location) {
          self.callback(null, location)
        };
        strategy.authenticate(mockRequest, { display: 'mobile' });
      },

      'sets authorization param to mobile': function(err, location) {
        var params = url.parse(location, true).query;
        assert.equal(params.display, 'mobile');
      }
    }
  },

  'strategy when loading user profile': {
    topic: function() {
      var strategy = new RakutenStrategy({
          clientID    : CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          redirectURL : REDIRECT_URI,
          scope : "openid"
      },
      function() {});

      // mock
      strategy._oauth2.getProtectedResource = function(url, accessToken, callback) {
        if (url == PROFILE_PAGE) {
          var body = '{"id":"500308595","name":"Jared Hanson","first_name":"Jared","last_name":"Hanson","link":"http:\\/\\/www.facebook.com\\/jaredhanson","username":"jaredhanson","gender":"male","email":"jaredhanson\\u0040example.com"}';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user profile URL'));
        }
      }
      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        process.nextTick(function () {
          strategy.userProfile(ACCESS_TOKEN, done);
        });
      },
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'rakuten');
        assert.equal(profile.id, '500308595');
        assert.equal(profile.username, 'jaredhanson');
        assert.equal(profile.displayName, 'Jared Hanson');
        assert.equal(profile.name.familyName, 'Hanson');
        assert.equal(profile.name.givenName, 'Jared');
        assert.equal(profile.gender, 'male');
        assert.equal(profile.profileUrl, 'http://www.facebook.com/jaredhanson');
        assert.lengthOf(profile.emails, 1);
        assert.equal(profile.emails[0].value, 'jaredhanson@example.com');
        assert.isUndefined(profile.photos);
      },
      'should set raw property' : function(err, profile) {
        assert.ok('_raw' in profile);
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.ok('_json' in profile);
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile with profileURL option': {
    topic: function() {
      var strategy = new RakutenStrategy({
          clientID    : CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          redirectURL : REDIRECT_URI,
          scope : "openid"
      },
      function() {});
      
      // mock
      strategy._oauth2.getProtectedResource = function(url, accessToken, callback) {
        if (url == PROFILE_PAGE) {
          var body = '{"id":"500308595","name":"Jared Hanson","first_name":"Jared","last_name":"Hanson","link":"http:\\/\\/www.facebook.com\\/jaredhanson","username":"jaredhanson","gender":"male","email":"jaredhanson\\u0040example.com"}';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user profile URL: ' + url));
        }
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile(ACCESS_TOKEN, done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'rakuten');
        assert.equal(profile.id, '500308595');
        assert.equal(profile.username, 'jaredhanson');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },
  
  'strategy when loading user profile with mapped profile fields': {
    topic: function() {
      var strategy = new RakutenStrategy({
          clientID    : CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          redirectURL : REDIRECT_URI,
          scope : "openid"

      },
      function() {});

      // mock
      strategy._oauth2.getProtectedResource = function(url, accessToken, callback) {
        if (url == PROFILE_PAGE) {
          var body = '{"name":"\u5c71\u53e3\u6d0b\u5e73","given_name":"\u6d0b\u5e73","given_name#ja-Kana-JP":"\u30e8\u30a6\u30d8\u30a4","given_name#ja-Hani-JP":"\u6d0b\u5e73","family_name":"\u5c71\u53e3","family_name#ja-Kana-JP":"\u30e4\u30de\u30b0\u30c1","family_name#ja-Hani-JP":"\u5c71\u53e3","locale":"ja-JP","birthday":"1987","gender":"male"}';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user profile URL: ' + url));
        }
      }
      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile(ACCESS_TOKEN, done);
        });
      },

      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'rakuten');
        console.log(profile);
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },

  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new RakutenStrategy({
          clientID    : CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          redirectURL : REDIRECT_URI,
          scope : "openid"
      },
      function() {});

      // mock
      strategy._oauth2.getProtectedResource = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }
      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile(ACCESS_TOKEN, done);
        });
      },

      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },
}).export(module);
