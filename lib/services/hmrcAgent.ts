import axios from 'axios';
import { HMRCAgentAuthRequest, HMRCAgentAuthResponse } from '../types/onboarding';

const HMRC_API_BASE =
  process.env.HMRC_ENV === 'production'
    ? 'https://api.service.hmrc.gov.uk'
    : 'https://test-api.service.hmrc.gov.uk';

// Get OAuth access token for HMRC API
async function getHMRCAccessToken(): Promise<string> {
  try {
    const response = await axios.post(
      `${HMRC_API_BASE}/oauth/token`,
      new URLSearchParams({
        client_id: process.env.HMRC_CLIENT_ID || '',
        client_secret: process.env.HMRC_CLIENT_SECRET || '',
        grant_type: 'client_credentials',
        scope: 'write:sent-invitations read:received-invitations',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  } catch (error: any) {
    console.error('Error getting HMRC access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with HMRC API');
  }
}

// Create agent authorization invitation for VAT
export async function createVATAgentAuthorization(
  vatNumber: string,
  vatRegistrationDate: string, // Format: YYYY-MM-DD
  clientEmail?: string
): Promise<{
  success: boolean;
  data?: HMRCAgentAuthResponse;
  error?: string;
}> {
  try {
    const accessToken = await getHMRCAccessToken();
    const agentReferenceNumber = process.env.HMRC_AGENT_REFERENCE_NUMBER;

    if (!agentReferenceNumber) {
      throw new Error('HMRC Agent Reference Number not configured');
    }

    // Format VAT number (remove spaces, GB prefix)
    const cleanVatNumber = vatNumber.replace(/[^0-9]/g, '');

    // Create invitation
    const response = await axios.post(
      `${HMRC_API_BASE}/agents/${agentReferenceNumber}/invitations`,
      {
        service: ['HMRC-MTD-VAT'],
        clientIdType: 'vrn',
        clientId: cleanVatNumber,
        knownFact: vatRegistrationDate, // VAT registration date
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.hmrc.1.0+json',
        },
      }
    );

    const invitationData = response.data;

    return {
      success: true,
      data: {
        invitationId: invitationData.invitationId,
        arn: agentReferenceNumber,
        service: 'HMRC-MTD-VAT',
        clientId: cleanVatNumber,
        status: 'Pending',
        expiryDate: invitationData.expiryDate,
        invitationLink: invitationData._links?.self?.href || '',
      },
    };
  } catch (error: any) {
    console.error('Error creating VAT agent authorization:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Create agent authorization invitation for Self Assessment
export async function createSAAgentAuthorization(
  nino: string, // National Insurance Number
  postcode: string
): Promise<{
  success: boolean;
  data?: HMRCAgentAuthResponse;
  error?: string;
}> {
  try {
    const accessToken = await getHMRCAccessToken();
    const agentReferenceNumber = process.env.HMRC_AGENT_REFERENCE_NUMBER;

    if (!agentReferenceNumber) {
      throw new Error('HMRC Agent Reference Number not configured');
    }

    // Format NI number (remove spaces)
    const cleanNino = nino.replace(/\s/g, '').toUpperCase();

    // Create invitation
    const response = await axios.post(
      `${HMRC_API_BASE}/agents/${agentReferenceNumber}/invitations`,
      {
        service: ['HMRC-MTD-IT'],
        clientIdType: 'ni',
        clientId: cleanNino,
        knownFact: postcode.replace(/\s/g, '').toUpperCase(),
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.hmrc.1.0+json',
        },
      }
    );

    const invitationData = response.data;

    return {
      success: true,
      data: {
        invitationId: invitationData.invitationId,
        arn: agentReferenceNumber,
        service: 'HMRC-MTD-IT',
        clientId: cleanNino,
        status: 'Pending',
        expiryDate: invitationData.expiryDate,
        invitationLink: invitationData._links?.self?.href || '',
      },
    };
  } catch (error: any) {
    console.error('Error creating SA agent authorization:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Check invitation status
export async function checkInvitationStatus(invitationId: string): Promise<{
  success: boolean;
  status?: 'Pending' | 'Accepted' | 'Rejected' | 'Expired' | 'Cancelled';
  error?: string;
}> {
  try {
    const accessToken = await getHMRCAccessToken();
    const agentReferenceNumber = process.env.HMRC_AGENT_REFERENCE_NUMBER;

    const response = await axios.get(
      `${HMRC_API_BASE}/agents/${agentReferenceNumber}/invitations/${invitationId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.hmrc.1.0+json',
        },
      }
    );

    return {
      success: true,
      status: response.data.status,
    };
  } catch (error: any) {
    console.error('Error checking invitation status:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

// Get client invitation link
export function getClientInvitationAcceptanceUrl(invitationId: string): string {
  const baseUrl =
    process.env.HMRC_ENV === 'production'
      ? 'https://www.tax.service.gov.uk'
      : 'https://www.qa.tax.service.gov.uk';

  return `${baseUrl}/invitations/agents/${process.env.HMRC_AGENT_REFERENCE_NUMBER}/invitations/${invitationId}`;
}

// Cancel invitation
export async function cancelInvitation(invitationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const accessToken = await getHMRCAccessToken();
    const agentReferenceNumber = process.env.HMRC_AGENT_REFERENCE_NUMBER;

    await axios.delete(
      `${HMRC_API_BASE}/agents/${agentReferenceNumber}/invitations/${invitationId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.hmrc.1.0+json',
        },
      }
    );

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error cancelling invitation:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

// List all pending invitations
export async function listPendingInvitations(): Promise<{
  success: boolean;
  invitations?: any[];
  error?: string;
}> {
  try {
    const accessToken = await getHMRCAccessToken();
    const agentReferenceNumber = process.env.HMRC_AGENT_REFERENCE_NUMBER;

    const response = await axios.get(
      `${HMRC_API_BASE}/agents/${agentReferenceNumber}/invitations`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.hmrc.1.0+json',
        },
        params: {
          status: 'Pending',
        },
      }
    );

    return {
      success: true,
      invitations: response.data._embedded?.invitations || [],
    };
  } catch (error: any) {
    console.error('Error listing invitations:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}
