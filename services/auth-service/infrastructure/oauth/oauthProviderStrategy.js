class OAuthProviderStrategy {
  getAuthorizationUrl() {
    throw new Error('getAuthorizationUrl must be implemented by an OAuth provider strategy');
  }

  async exchangeCodeForProfile() {
    throw new Error('exchangeCodeForProfile must be implemented by an OAuth provider strategy');
  }
}

module.exports = OAuthProviderStrategy;
