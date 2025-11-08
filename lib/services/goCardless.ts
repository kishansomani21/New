import axios from 'axios';
import { GoCardlessPaymentLink } from '../types/onboarding';

const GOCARDLESS_API_BASE =
  process.env.GOCARDLESS_ENV === 'sandbox'
    ? 'https://api-sandbox.gocardless.com'
    : 'https://api.gocardless.com';

// Create a customer in GoCardless
export async function createGoCardlessCustomer(
  name: string,
  email: string,
  companyName?: string
): Promise<{
  success: boolean;
  customerId?: string;
  error?: string;
}> {
  try {
    const response = await axios.post(
      `${GOCARDLESS_API_BASE}/customers`,
      {
        customers: {
          email,
          given_name: name.split(' ')[0],
          family_name: name.split(' ').slice(1).join(' ') || name,
          company_name: companyName,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GOCARDLESS_ACCESS_TOKEN}`,
          'GoCardless-Version': '2015-07-06',
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      customerId: response.data.customers.id,
    };
  } catch (error: any) {
    console.error('Error creating GoCardless customer:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

// Create a billing request flow (payment link)
export async function createPaymentLink(
  customerId: string,
  clientName: string
): Promise<{
  success: boolean;
  data?: GoCardlessPaymentLink;
  error?: string;
}> {
  try {
    // Create a billing request
    const billingRequestResponse = await axios.post(
      `${GOCARDLESS_API_BASE}/billing_requests`,
      {
        billing_requests: {
          mandate_request: {
            currency: 'GBP',
            scheme: 'bacs',
          },
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GOCARDLESS_ACCESS_TOKEN}`,
          'GoCardless-Version': '2015-07-06',
          'Content-Type': 'application/json',
        },
      }
    );

    const billingRequestId = billingRequestResponse.data.billing_requests.id;

    // Create billing request flow (this generates the payment link)
    const flowResponse = await axios.post(
      `${GOCARDLESS_API_BASE}/billing_request_flows`,
      {
        billing_request_flows: {
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/gocardless/callback`,
          exit_uri: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/success`,
          lock_customer_details: false,
          billing_request: billingRequestId,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GOCARDLESS_ACCESS_TOKEN}`,
          'GoCardless-Version': '2015-07-06',
          'Content-Type': 'application/json',
        },
      }
    );

    const flowData = flowResponse.data.billing_request_flows;

    return {
      success: true,
      data: {
        url: flowData.authorisation_url,
        linkId: flowData.id,
        customerId,
      },
    };
  } catch (error: any) {
    console.error('Error creating GoCardless payment link:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

// Create mandate for existing customer
export async function createMandateForCustomer(
  customerId: string,
  accountNumber: string,
  sortCode: string,
  accountHolderName: string
): Promise<{
  success: boolean;
  mandateId?: string;
  error?: string;
}> {
  try {
    // First, create a customer bank account
    const bankAccountResponse = await axios.post(
      `${GOCARDLESS_API_BASE}/customer_bank_accounts`,
      {
        customer_bank_accounts: {
          account_number: accountNumber,
          branch_code: sortCode,
          account_holder_name: accountHolderName,
          country_code: 'GB',
          links: {
            customer: customerId,
          },
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GOCARDLESS_ACCESS_TOKEN}`,
          'GoCardless-Version': '2015-07-06',
          'Content-Type': 'application/json',
        },
      }
    );

    const bankAccountId = bankAccountResponse.data.customer_bank_accounts.id;

    // Create mandate
    const mandateResponse = await axios.post(
      `${GOCARDLESS_API_BASE}/mandates`,
      {
        mandates: {
          scheme: 'bacs',
          links: {
            customer_bank_account: bankAccountId,
          },
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GOCARDLESS_ACCESS_TOKEN}`,
          'GoCardless-Version': '2015-07-06',
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      mandateId: mandateResponse.data.mandates.id,
    };
  } catch (error: any) {
    console.error('Error creating GoCardless mandate:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}

// Check mandate status
export async function getMandateStatus(mandateId: string): Promise<{
  success: boolean;
  status?: 'pending_customer_approval' | 'pending_submission' | 'submitted' | 'active' | 'failed' | 'cancelled';
  error?: string;
}> {
  try {
    const response = await axios.get(
      `${GOCARDLESS_API_BASE}/mandates/${mandateId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GOCARDLESS_ACCESS_TOKEN}`,
          'GoCardless-Version': '2015-07-06',
        },
      }
    );

    return {
      success: true,
      status: response.data.mandates.status,
    };
  } catch (error: any) {
    console.error('Error getting mandate status:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
}
