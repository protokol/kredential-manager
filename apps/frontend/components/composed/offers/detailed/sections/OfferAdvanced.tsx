// eslint-disable-next-line
const OfferAdvanced = ({ offerData }: { offerData: any }) => {
  return (
    <div className='max-h-60vh w-full max-w-content-w overflow-x-hidden overflow-y-scroll whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500'>
      {JSON.stringify(offerData, null, 5)}
    </div>
  );
};

export default OfferAdvanced;
