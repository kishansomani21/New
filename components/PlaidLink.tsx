'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface PlaidLinkProps {
  onSuccess: (publicToken: string) => void;
}

export default function PlaidLink({ onSuccess }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch link token from backend
    const createLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
        });
        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (error) {
        console.error('Error creating link token:', error);
      }
    };

    createLinkToken();
  }, []);

  const onSuccessCallback = useCallback(
    (public_token: string) => {
      onSuccess(public_token);
    },
    [onSuccess]
  );

  const config = {
    token: linkToken,
    onSuccess: onSuccessCallback,
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <button
      onClick={() => open()}
      disabled={!ready || !linkToken}
      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {!linkToken ? 'Loading...' : 'Connect Bank Account'}
    </button>
  );
}
