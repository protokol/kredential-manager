'use client';

import type { FC } from 'react';

import ContentLayout from '@components/composed/layout/ContentLayout';
import OfferDetailedContent from '@components/composed/offers/detailed/OfferDetailedContent';

type OfferDetailedPageProps = {
  params: {
    offerId: string;
  };
};

const OfferDetailedPage: FC<OfferDetailedPageProps> = ({
  params: { offerId }
}: OfferDetailedPageProps) => (
  <ContentLayout title='Credential Offer'>
    <OfferDetailedContent offerId={offerId} />
  </ContentLayout>
);

export default OfferDetailedPage;
