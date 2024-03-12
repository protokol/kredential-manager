import { useTranslations } from 'next-intl';

// eslint-disable-next-line
const CredentialAdvanced = ({ credentialData }: { credentialData: any }) => {
  const t = useTranslations();
  return (
    <div>
      <div className='mb-5'>{t('credentials.detailed.schema_json_info')}</div>
      <div className='max-h-60vh overflow-y-scroll whitespace-pre-wrap rounded-md border-1.5 border-slate-200 bg-slate-50 p-5 text-slate-500'>
        {JSON.stringify(credentialData, null, 5)}
      </div>
    </div>
  );
};

export default CredentialAdvanced;
