import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[import.meta.env.VITE_PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': import.meta.env.VITE_PLAID_CLIENT_ID,
      'PLAID-SECRET': import.meta.env.VITE_PLAID_SECRET_SANDBOX,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export const createLinkToken = async (userId: string) => {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Smarter Investment',
    products: ['transactions'],
    country_codes: ['US'],
    language: 'en',
  });
  
  return response.data;
};

export const exchangePublicToken = async (publicToken: string) => {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
  
  return response.data.access_token;
};

export const getTransactions = async (
  accessToken: string,
  startDate: string,
  endDate: string
) => {
  const response = await plaidClient.transactionsGet({
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
  });
  
  return response.data.transactions;
};