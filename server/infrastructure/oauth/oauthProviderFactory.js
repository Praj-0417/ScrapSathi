'use strict';

const GoogleOAuthStrategy = require('./googleOAuthStrategy');

class OAuthProviderFactory {
  static create(provider, config) {
    switch (provider) {
      case 'google':
        return new GoogleOAuthStrategy(config);
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }
}

module.exports = OAuthProviderFactory;
