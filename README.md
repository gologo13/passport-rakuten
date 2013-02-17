# passport-rakuten
===========

Oauth2.0 npm package for Rakuten OAuth

[Passport](http://passportjs.org/) strategy for authenticating with [Rakuten OAuth](https://webservice.rakuten.co.jp/document/oauth) using the OAuth 2.0 API

This module can be used with passport in Node.js.
You can integrate into below applications or frameworks.
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-rakuten

## Usage

### Configuration Strategy

This Rakuten passport module requires your application' id.
You can get this id from [Rakuten Web Service](http://webservice.rakuten.co.jp/)

### Authorization Endpoint

    var passport = require('passport');
    
	passport.use(new RakutenStrategy({
	    clientID     : <RAKUTEN_APP_ID>,
		clientSecret : <RAKUTEN_APP_SECRET>,
		callbackURL  : <CALL_BACK_URL>,
	}, function(accessToken, refreshtoken, profile, done){
	    // With this accessToken you can access user profile data.
		// In the case that accessToken is expired, you should 
		// regain it with refreshToken. So you have to keep these token
		// safely. done will get user profile data such as openid in YConnect	
	});

### Token Endpoint

With this module, you don't have to do anything to get accessToken. 
As you see above, you have already obtain accessToken and refreshToken.
So this process is not required with this module.

### License

MIT License. Please see the LICENSE file for details.
