import { jest } from '@jest/globals';

export const mockStripeCheckoutSessions = {
  create: jest.fn().mockResolvedValue({
    id: 'test_session_123',
    url: 'https://test.stripe.com/checkout'
  }),
  retrieve: jest.fn().mockResolvedValue({
    payment_status: 'paid'
  })
};

export const mockStripe = {
  checkout: {
    sessions: mockStripeCheckoutSessions
  }
};

jest.mock('stripe', () => {
  return jest.fn(() => mockStripe);
});

export default mockStripe; 