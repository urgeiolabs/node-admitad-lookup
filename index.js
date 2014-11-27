var request = require('superagent'),
  config = require('./config.json');
  OAuth = require('oauth');

module.exports = function(opts) {
  return new Admitad(opts);
};

var Admitad = function Admitad(opts) {
  if ('object' === typeof opts) {
    this._keywords = opts.keywords;
  } else {
    this._keywords = opts;
  }

  function bindSetters(o, property) {
    var _value = value;
    o.prototype[property] = function(value) {
      return o['_' + property] = value, o;
    };
  }

  config.api_params.forEach(
    function(property) {
      Admitad.prototype[property] = function(value) {
        return this['_' + property] = value, this;
      };
    }.bind(this));
};

Admitad.prototype.done = function(cb) {
  var self = this;
  return requestAccessToken(function(err, access_token) {
    if(err) return cb(err);

    return request
      .get(config.endpoint + this._websiteId + '/')
      .set('Authorization', 'Bearer ' + access_token)
      .query({ campaign: this._campaignId })
      .query({ category: this._category })
      .query({ price_from: this._priceFrom })
      .query({ price_to: this._proceTo })
      .end(function(err, res) {
        if(err) return cb(err);
        return cb(null, res);
      });
  });
};

function requestAccessToken(cb) {
  var OAuth2 = OAuth.OAuth2;
  var oauth2 = new OAuth2(config.client_id, config.secret, 'https://api.admitad.com/', null, '/token/', null);

  console.log('request access_token...');
  oauth2.getOAuthAccessToken('', {
    'grant_type': 'client_credentials',
    'scope': config.auth_scope,
    'client_id': config.client_id
  }, function(e, access_token, refresh_token, results) {
    if (e) {
      console.log('access token error!');
      cb(e, null);
    } else {
      console.log('access token granted!');
      cb(null, access_token);
    }
  });
}
