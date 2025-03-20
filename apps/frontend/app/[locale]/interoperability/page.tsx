'use client';

import { useState } from 'react';
import type { Credential } from '@utils/api/interop/interop.type';
import { getInteropCredentials } from '@utils/api/interop/interop.api';

import Image from 'next/image';
import logo from '@public/kredential_logo.png';

import ContentLayout from '@components/composed/layout/ContentLayout';

export default function InteroperabilityPublicPage() {
  const [holderDid, setHolderDid] = useState('did:key:z2dmzD81cgPx8Vki7JbuuMmFYrWPgYoytykUZ3eyqht1j9KbnUYrszwPktqhonAPmKPuyZatC7T9662ow4eJNGWRAS7m44sNbxjsHfLvzN8Gw9ZHqPfy3iuSHLVUsEeWWvjj7LCEoYNDPZVBN2TU6SeTjs3yXkSPtDKeVG7qfzfr3bgZKr');
  const [credentialsResponse, setCredentialsResponse] = useState<Credential[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate DID format
  const validateDid = (did: string): boolean => {
    // Basic check for did:key format
    const didKeyPattern = /^did:key:[a-zA-Z0-9]{32,}$/;
    return didKeyPattern.test(did);
  };

  const getCredentials = async () => {
    if (!holderDid) {
      setError('Please enter a holder DID');
      return;
    }

    if (!validateDid(holderDid)) {
      setError('Invalid DID format. DID should start with "did:key:" followed by a valid key.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getInteropCredentials(holderDid);
      setCredentialsResponse(data);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      setError('Failed to fetch credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentLayout title="">
      <div className="flex flex-col items-center space-y-8 pb-8">
        <div className="flex flex-col items-center space-y-4">
          <Image alt="logo" src={logo} className="w-60" />
          <h1 className="text-2xl font-bold text-slate-800">Interoperability Testing</h1>
        </div>
        
        <div className="w-full bg-white p-6 rounded-md border border-slate-100">
          <div className="mb-8">
            <div className="mb-4">
              <input 
                type="text" 
                value={holderDid} 
                onChange={(e) => setHolderDid(e.target.value)} 
                placeholder="Enter holder DID" 
                className="w-full p-2 border rounded mb-3 text-sm"
              />
              <button 
                onClick={getCredentials} 
                disabled={loading}
                className="bg-sky-900 text-white px-6 py-3 text-lg font-medium rounded hover:bg-sky-950 active:bg-sky-900 active:border-sky-950 disabled:text-slate-600 disabled:bg-slate-200 w-full"
              >
                {loading ? 'Loading...' : credentialsResponse ? 'Refresh Offers' : 'Get Offers'}
              </button>
            </div>
            
            {error && <div className="bg-red-50 text-red-600 p-3 my-3 rounded">{error}</div>}
            
            {credentialsResponse && (
              <div className="mt-4">
                <div id="credentialsQrCodes" className="grid gap-6 md:grid-cols-2 mt-4">
                  {credentialsResponse.map((credential, index) => (
                    <div key={index} className="border rounded-lg p-4 shadow-sm">
                      <h4 className="text-lg mb-2">Credential Type: {credential.credentialType}</h4>
                      <p className="text-sm mb-2"><span className="font-medium">Flow Type:</span> {credential.type}</p>
                      {credential.qrCode && (
                        <div className="flex justify-center mb-4">
                          <img 
                            src={credential.qrCode} 
                            alt="Credential QR Code" 
                            className="max-w-[200px]"
                          />
                        </div>
                      )}
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Offer URL:</span> 
                          <a href={credential.offerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">
                            {credential.offerUrl}
                          </a>
                        </p>
                        {credential.pin && (
                          <p><span className="font-medium">Pin:</span> {credential.pin}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
} 