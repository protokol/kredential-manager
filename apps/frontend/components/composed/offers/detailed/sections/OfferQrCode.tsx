import Image from 'next/image';

const OfferQrCode = ({ qrCodeSrc }: { qrCodeSrc: string }) => (
  <div>
    {qrCodeSrc && (
      <Image src={qrCodeSrc} alt='Offer QR Code' width={300} height={300} />
    )}
  </div>
);

export default OfferQrCode;
