class PaymentProviderFactory {
  static create(provider, strategies = {}) {
    const strategy = strategies[provider];

    if (!strategy) {
      throw new Error(`Unsupported payment provider: ${provider}`);
    }

    return strategy;
  }
}

module.exports = PaymentProviderFactory;
