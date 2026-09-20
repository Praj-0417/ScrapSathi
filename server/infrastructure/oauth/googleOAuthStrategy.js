'use strict';

const OAuthProviderStrategy = require('./oauthProviderStrategy');

class GoogleOAuthStrategy extends OAuthProviderStrategy {
  constructor({ clientId, clientSecret, callbackUrl }) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.callbackUrl = callbackUrl;
  }

  getAuthorizationUrl() {
    throw new Error('Google OAuth is not configured yet');
  }

  async exchangeCodeForProfile() {
    throw new Error('Google OAuth is not configured yet');
  }
}

module.exports = GoogleOAuthStrategy;
