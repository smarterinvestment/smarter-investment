// api/exchange-public-token.js
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { public_token } = req.body;

    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    // TODO: Guardar access_token en Firebase para el usuario
    const access_token = response.data.access_token;

    res.status(200).json({ access_token });
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
}