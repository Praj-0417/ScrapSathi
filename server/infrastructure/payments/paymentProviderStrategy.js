class PaymentProviderStrategy {
  async createPayout() {
    throw new Error('createPayout must be implemented by a payment provider strategy');
  }

  async getPayoutStatus() {
    throw new Error('getPayoutStatus must be implemented by a payment provider strategy');
  }
}

module.exports = PaymentProviderStrategy;
