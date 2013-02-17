/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;

/**
 * `Strategy` constructor.
 *
 * The Rakuten authentication strategy authenticates requests by delegating to
 * Rakuten using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Rakuten application's App ID
 *   - `clientSecret`  your Rakuten application's App Secret
 *   - `callbackURL`   URL to which Rakuten will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new  RakutenStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret',
 *         callbackURL: 'https://www.example.net/auth/rakuten/callback',
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://app.rakuten.co.jp/services/authorize';
  options.tokenURL = options.tokenURL || 'https://app.rakuten.co.jp/services/token';
  options.scopeSeparator = options.scopeSeparator || ' ';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'rakuten';
  this._profileURL = options.profileURL || 'https://app.rakuten.co.jp/services/api/FavoriteBookmark/List/20120627?';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);

/**
 * Return extra Rakuten specific parameters to be included in the authorization
 * request.
 * But no option is available on Feb. 17, 2013
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function (options) {
  var params = {};
  return params;
};

/**
 * Retrieve bookmarks from Rakuten.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`           always set to `rakuten`
 *   - `summary.count`      bookmark counts
 *   - `summary.hits`       bookmark hits
 *   - `summary.pageCount`  bookmark page count
 *   - `items`              bookmark lists(array)
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  var url = this._profileURL;

  this._oauth2.getProtectedResource(url, accessToken, function (err, body, res) {

    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

    try {
      var json = JSON.parse(body);

      var profile = { provider: 'rakuten' };
      profile.summary = {
        count: json.summary.count
    ,   hits: json.summary.hits
    ,   pageCount: json.summary.pageCount
      };
      profile.items = json.items;

      profile._raw  = body;
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
