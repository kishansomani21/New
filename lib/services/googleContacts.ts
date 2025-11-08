import { google } from 'googleapis';
import { ClientDetailedInfo } from '../types/onboarding';

export async function getGooglePeopleClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/contacts',
      'https://www.googleapis.com/auth/directory.readonly',
    ],
  });

  const people = google.people({ version: 'v1', auth });
  return people;
}

export async function addClientToContacts(client: ClientDetailedInfo): Promise<{
  success: boolean;
  contactId?: string;
  error?: string;
}> {
  try {
    const people = await getGooglePeopleClient();

    const contactResource: any = {
      names: [
        {
          givenName: client.name.split(' ')[0],
          familyName: client.name.split(' ').slice(1).join(' ') || '',
        },
      ],
      emailAddresses: [
        {
          value: client.email,
          type: 'work',
        },
      ],
      phoneNumbers: [
        {
          value: client.phone,
          type: 'work',
        },
      ],
    };

    // Add company name if available
    if (client.companyName) {
      contactResource.organizations = [
        {
          name: client.companyName,
          type: 'work',
        },
      ];
    }

    // Add address if available
    if (client.address && client.postcode) {
      contactResource.addresses = [
        {
          streetAddress: client.address,
          postalCode: client.postcode,
          country: 'UK',
          type: 'work',
        },
      ];
    }

    // Add notes with tax information
    const notes = [];
    if (client.businessType) notes.push(`Business Type: ${client.businessType}`);
    if (client.utr) notes.push(`UTR: ${client.utr}`);
    if (client.vatNumber) notes.push(`VAT Number: ${client.vatNumber}`);
    if (client.payeReference) notes.push(`PAYE Reference: ${client.payeReference}`);
    if (client.isPAYERegistered) notes.push('PAYE Registered: Yes');
    if (client.isVATRegistered) notes.push('VAT Registered: Yes');
    if (client.isCISRegistered) notes.push('CIS Registered: Yes');
    if (client.notes) notes.push(client.notes);

    if (notes.length > 0) {
      contactResource.biographies = [
        {
          value: notes.join('\n'),
          contentType: 'TEXT_PLAIN',
        },
      ];
    }

    const response = await people.people.createContact({
      requestBody: contactResource,
    });

    return {
      success: true,
      contactId: response.data.resourceName,
    };
  } catch (error: any) {
    console.error('Error adding contact to Google Contacts:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateClientContact(
  contactId: string,
  client: ClientDetailedInfo
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const people = await getGooglePeopleClient();

    // First, get the current contact to get the etag
    const currentContact = await people.people.get({
      resourceName: contactId,
      personFields: 'names,emailAddresses,phoneNumbers,organizations,addresses,biographies',
    });

    const contactResource: any = {
      etag: currentContact.data.etag,
      names: [
        {
          givenName: client.name.split(' ')[0],
          familyName: client.name.split(' ').slice(1).join(' ') || '',
        },
      ],
      emailAddresses: [
        {
          value: client.email,
          type: 'work',
        },
      ],
      phoneNumbers: [
        {
          value: client.phone,
          type: 'work',
        },
      ],
    };

    if (client.companyName) {
      contactResource.organizations = [
        {
          name: client.companyName,
          type: 'work',
        },
      ];
    }

    if (client.address && client.postcode) {
      contactResource.addresses = [
        {
          streetAddress: client.address,
          postalCode: client.postcode,
          country: 'UK',
          type: 'work',
        },
      ];
    }

    const notes = [];
    if (client.businessType) notes.push(`Business Type: ${client.businessType}`);
    if (client.utr) notes.push(`UTR: ${client.utr}`);
    if (client.vatNumber) notes.push(`VAT Number: ${client.vatNumber}`);
    if (client.payeReference) notes.push(`PAYE Reference: ${client.payeReference}`);
    if (client.isPAYERegistered) notes.push('PAYE Registered: Yes');
    if (client.isVATRegistered) notes.push('VAT Registered: Yes');
    if (client.isCISRegistered) notes.push('CIS Registered: Yes');
    if (client.notes) notes.push(client.notes);

    if (notes.length > 0) {
      contactResource.biographies = [
        {
          value: notes.join('\n'),
          contentType: 'TEXT_PLAIN',
        },
      ];
    }

    await people.people.updateContact({
      resourceName: contactId,
      updatePersonFields: 'names,emailAddresses,phoneNumbers,organizations,addresses,biographies',
      requestBody: contactResource,
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error updating contact in Google Contacts:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function searchContactByEmail(email: string): Promise<{
  found: boolean;
  contactId?: string;
  error?: string;
}> {
  try {
    const people = await getGooglePeopleClient();

    const response = await people.people.searchContacts({
      query: email,
      readMask: 'names,emailAddresses',
    });

    if (response.data.results && response.data.results.length > 0) {
      const contact = response.data.results[0].person;
      return {
        found: true,
        contactId: contact?.resourceName,
      };
    }

    return {
      found: false,
    };
  } catch (error: any) {
    console.error('Error searching contact in Google Contacts:', error);
    return {
      found: false,
      error: error.message,
    };
  }
}
