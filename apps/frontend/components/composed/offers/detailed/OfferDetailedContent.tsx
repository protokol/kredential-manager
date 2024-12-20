'use client';

import OfferAdvanced from './sections/OfferAdvanced';
import OfferQrCode from './sections/OfferQrCode';

import { useOffer } from '@utils/api/offers/offers.hook';

import Spinner from '@ui/Spinner';
import Accordion from '@ui/accordion/Accordion';

const OfferDetailedContent = ({ offerId }: { offerId: string }) => {
  const { data: offerData, isLoading } = useOffer(offerId);

  return (
    <div>
      {isLoading ? (
        <div className='flex justify-center'>
          <Spinner />
        </div>
      ) : (
        <div>
          <div className='mb-6 text-lg font-bold text-sky-950'>
            {offerData?.title}
          </div>
          <Accordion
            type='multiple'
            defaultValue={['1']}
            items={[
              {
                id: '1',
                title: 'JSON Input',
                content: <OfferAdvanced offerData={offerData} />
              },
              {
                id: '2',
                title: 'QR Code',
                content: <OfferQrCode qrCodeSrc={offerData?.qr_code} />
              }
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default OfferDetailedContent;
