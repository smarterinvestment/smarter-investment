// api/get-transactions.js
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
    const { access_token, start_date, end_date } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token required' });
    }

    // Obtener transacciones de los últimos 30 días
    const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    const response = await plaidClient.transactionsGet({
      access_token: access_token,
      start_date: startDate,
      end_date: endDate,
      options: {
        count: 100,
        offset: 0,
      },
    });

    // Obtener balances también
    const balanceResponse = await plaidClient.accountsBalanceGet({
      access_token: access_token,
    });

    res.status(200).json({
      transactions: response.data.transactions,
      accounts: balanceResponse.data.accounts,
      total_transactions: response.data.total_transactions,
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ 
      error: 'Failed to get transactions',
      details: error.message 
    });
  }
}