// api/create-link-token.js
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET_SANDBOX,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId || 'user-123',
      },
      client_name: 'Smarter Investment',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    });

    res.status(200).json({ link_token: response.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: 'Failed to create link token' });
  }
}