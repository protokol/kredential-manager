'use client';

import Image from 'next/image';
import { useState } from 'react';

import logo from '@public/kredential_logo.png';

import { getInteropCredentials } from '@utils/api/interop/interop.api';
import type { Credential } from '@utils/api/interop/interop.type';

import ContentLayout from '@components/composed/layout/ContentLayout';

function InteroperabilityPublicPage() {
  const [holderDid, setHolderDid] = useState('');
  const [credentialsResponse, setCredentialsResponse] = useState<
    Credential[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate DID format
  const validateDid = (did: string): boolean => {
    if (!did.startsWith('did:key:')) {
      return false;
    }
    const keyPart = did.substring(8); 
    return keyPart.length >= 32;
  };

  const getCredentials = async () => {
    if (!holderDid) {
      setError('Please enter a holder DID');
      return;
    }

    if (!validateDid(holderDid)) {
      setError(
        'Invalid DID format. DID should start with "did:key:" followed by a valid key.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getInteropCredentials(holderDid);
      setCredentialsResponse(data);
    } catch (error) {
      setError('Failed to fetch credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ContentLayout title=''>
      <div className='flex flex-col items-center space-y-8 pb-8'>
        <div className='flex flex-col items-center space-y-4'>
          <Image alt='logo' src={logo} className='w-60' />
          <h1 className='text-2xl font-bold text-slate-800'>
            Interoperability Testing
          </h1>
        </div>

        <div className='w-full rounded-md border border-slate-100 bg-white p-6'>
          <div className='mb-8'>
            <div className='mb-4'>
              <input
                type='text'
                value={holderDid}
                onChange={(e) => setHolderDid(e.target.value)}
                placeholder='Enter holder DID'
                className='mb-3 w-full rounded border p-2 text-sm'
              />
              <button
                onClick={getCredentials}
                disabled={loading}
                className='w-full rounded bg-sky-900 px-6 py-3 text-lg font-medium text-white hover:bg-sky-950 active:border-sky-950 active:bg-sky-900 disabled:bg-slate-200 disabled:text-slate-600'
              >
                {loading
                  ? 'Loading...'
                  : credentialsResponse
                    ? 'Refresh Offers'
                    : 'Get Offers'}
              </button>
            </div>

            {error && (
              <div className='my-3 rounded bg-red-50 p-3 text-red-600'>
                {error}
              </div>
            )}

            {credentialsResponse && (
              <div className='mt-4'>
                <div
                  id='credentialsQrCodes'
                  className='mt-4 grid gap-6 md:grid-cols-2'
                >
                  {credentialsResponse.map((credential: Credential, index: number) => (
                    <div
                      key={index}
                      className='rounded-lg border p-4 shadow-sm'
                    >
                      <h4 className='mb-2 text-lg'>
                        Credential Type: {credential.credentialType}
                      </h4>
                      <p className='mb-2 text-sm'>
                        <span className='font-medium'>Flow Type:</span>{' '}
                        {credential.type}
                      </p>
                       {credential.qrCode && (
                        <div className='mb-4 flex justify-center'>
                          <img
                            src={credential.qrCode}
                            alt='Credential QR Code'
                            className='max-w-[200px]'
                            width={200}
                            height={200}
                          />
                        </div>
                      )} 
                      <div className='space-y-1 text-sm'>
                        <p>
                          <span className='font-medium'>Offer URL:</span>
                          <a
                            href={credential.offerUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 break-all'
                          >
                            {credential.offerUrl}
                          </a>
                        </p>
                        {credential.pin && (
                          <p>
                            <span className='font-medium'>Pin:</span>{' '}
                            {credential.pin}
                          </p>
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

export default InteroperabilityPublicPage;
