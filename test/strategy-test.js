var vows   = require('vows')
  , assert = require('assert')
  , util   = require('util')
  , url    = require('url');
var RakutenStrategy = require('passport-rakuten/strategy')
  , Config = require('../config');

// constant
var BOOKMARK_PAGE = 'https://app.rakuten.co.jp/services/api/FavoriteBookmark/List/20120627?'

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
  },

  'strategy when loading user bookmark': {
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
        if (url == BOOKMARK_PAGE) {
          var body = '{"summary":{"count":1,"hits":1,"pageCount":1},"items":[{"item":{"bookmarkId":"4709771","itemCode":"book:11024900","productId":"","shopName":"楽天ブックス","shopUrl":"http://www.rakuten.co.jp/book","itemName":"マネジメント [ ピーター・ファーディナンド・ドラッカー ]","itemUrl":"http://item.rakuten.co.jp/book/1401537","smallImageUrl":"http://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0233/9784478410233.jpg?_ex=64x64","mediumImageUrl":"http://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0233/9784478410233.jpg?_ex=128x128","reviewCount":590,"reviewUrl":"http://review.rakuten.co.jp/item/1/213310_11024900/1.1/","pointRate":0,"reviewAverage":"4.25","postageFlag":0,"taxFlag":0,"affiliateUrl":""}}]}';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user bookmark URL'));
        }
      }
      return strategy;
    },

    'when told to load user bookmark': {
      topic: function(strategy) {
        var self = this;
        function done(err, bookmark) {
          self.callback(err, bookmark);
        }
        process.nextTick(function () {
          strategy.userProfile(ACCESS_TOKEN, done);
        });
      },
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load bookmark' : function(err, bookmark) {
        assert.equal(bookmark.provider, 'rakuten');
        assert.equal(bookmark.summary.count, '1');
        assert.equal(bookmark.summary.hits, '1');
        assert.equal(bookmark.summary.pageCount, '1');
      },
      'should set raw property' : function(err, bookmark) {
        assert.ok('_raw' in bookmark);
        assert.isString(bookmark._raw);
      },
      'should set json property' : function(err, bookmark) {
        assert.ok('_json' in bookmark);
        assert.isObject(bookmark._json);
      },
    },
  },

  'strategy when loading user bookmark with profileURL option': {
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
        if (url == BOOKMARK_PAGE) {
          var body = '{"summary":{"count":1,"hits":1,"pageCount":1},"items":[{"item":{"bookmarkId":"4709771","itemCode":"book:11024900","productId":"","shopName":"楽天ブックス","shopUrl":"http://www.rakuten.co.jp/book","itemName":"マネジメント [ ピーター・ファーディナンド・ドラッカー ]","itemUrl":"http://item.rakuten.co.jp/book/1401537","smallImageUrl":"http://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0233/9784478410233.jpg?_ex=64x64","mediumImageUrl":"http://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0233/9784478410233.jpg?_ex=128x128","reviewCount":590,"reviewUrl":"http://review.rakuten.co.jp/item/1/213310_11024900/1.1/","pointRate":0,"reviewAverage":"4.25","postageFlag":0,"taxFlag":0,"affiliateUrl":""}}]}';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user bookmark URL: ' + url));
        }
      }

      return strategy;
    },

    'when told to load user bookmark': {
      topic: function(strategy) {
        var self = this;
        function done(err, bookmark) {
          self.callback(err, bookmark);
        }

        process.nextTick(function () {
          strategy.userProfile(ACCESS_TOKEN, done);
        });
      },
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load bookmark' : function(err, bookmark) {
        assert.equal(bookmark.provider, 'rakuten');
        assert.equal(bookmark.summary.count, '1');
        assert.equal(bookmark.summary.hits, '1');
        assert.equal(bookmark.summary.pageCount, '1');
      },
      'should set raw property' : function(err, bookmark) {
        assert.isString(bookmark._raw);
      },
      'should set json property' : function(err, bookmark) {
        assert.isObject(bookmark._json);
      },
    },
  },

  'strategy when loading user bookmark with mapped bookmark fields': {
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
        if (url == BOOKMARK_PAGE) {
          var body = '{"summary":{"count":1,"hits":1,"pageCount":1},"items":[{"item":{"bookmarkId":"4709771","itemCode":"book:11024900","productId":"","shopName":"楽天ブックス","shopUrl":"http://www.rakuten.co.jp/book","itemName":"マネジメント [ ピーター・ファーディナンド・ドラッカー ]","itemUrl":"http://item.rakuten.co.jp/book/1401537","smallImageUrl":"http://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0233/9784478410233.jpg?_ex=64x64","mediumImageUrl":"http://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0233/9784478410233.jpg?_ex=128x128","reviewCount":590,"reviewUrl":"http://review.rakuten.co.jp/item/1/213310_11024900/1.1/","pointRate":0,"reviewAverage":"4.25","postageFlag":0,"taxFlag":0,"affiliateUrl":""}}]}';
          callback(null, body, undefined);
        } else {
          callback(new Error('Incorrect user bookmark URL: ' + url));
        }
      }
      return strategy;
    },

    'when told to load user bookmark': {
      topic: function(strategy) {
        var self = this;
        function done(err, bookmark) {
          self.callback(err, bookmark);
        }

        process.nextTick(function () {
          strategy.userProfile(ACCESS_TOKEN, done);
        });
      },

      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load bookmark' : function(err, bookmark) {
        assert.equal(bookmark.provider, 'rakuten');
      },
      'should set raw property' : function(err, bookmark) {
        assert.isString(bookmark._raw);
      },
      'should set json property' : function(err, bookmark) {
        assert.isObject(bookmark._json);
      },
    },
  },

  'strategy when loading user bookmark and encountering an error': {
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

    'when told to load user bookmark': {
      topic: function(strategy) {
        var self = this;
        function done(err, bookmark) {
          self.callback(err, bookmark);
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
      'should not load bookmark' : function(err, bookmark) {
        assert.isUndefined(bookmark);
      },
    },
  },
}).export(module);
