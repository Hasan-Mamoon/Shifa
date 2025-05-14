const mockStripeInstance = {
  checkout: {
    sessions: {
      retrieve: jest.fn().mockImplementation((sessionId) => {
        return Promise.resolve({
          id: sessionId,
          payment_status: 'paid',
          status: 'complete',
          customer: 'test_customer'
        });
      })
    }
  }
};

export default jest.fn(() => mockStripeInstance); 