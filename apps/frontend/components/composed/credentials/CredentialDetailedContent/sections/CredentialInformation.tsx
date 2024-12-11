import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

import { formatShortDate } from '@utils/helpers/dateFormatting';

import Input from '@ui/Input';

type Student = {
  date_of_birth: Date;
  email: string;
  enrollment_date: string;
  first_name: string;
  last_name: string;
  nationality: string;
  student_id: number;
};

type Information = {
  id: number;
  identifier: string;
  student: Student;
};

const Label = ({ text }: { text: string }) => (
  <div className='mb-2 text-sm text-slate-500'>{text}</div>
);

const CredentialInformation = (information: Information) => {
  const t = useTranslations();
  return (
    <div>
      <Label text={t('credentials.detailed.first_name')} />
      <Input
        disabled
        className='mb-4'
        value={information?.student?.first_name}
      />
      <Label text={t('credentials.detailed.last_name')} />
      <Input
        disabled
        className='mb-4'
        value={information?.student?.last_name}
      />
      {information?.student?.date_of_birth && (
        <>
          <Label text={t('credentials.detailed.date_of_birth')} />
          <Input
            disabled
            className='mb-4'
            value={
              formatShortDate(information?.student?.date_of_birth) || 'N/A'
            }
          />
        </>
      )}
      <Label text={t('credentials.detailed.address')} />
      <Input disabled className='mb-4' value='N/A' />
      <Label text={t('credentials.detailed.ebsi_id')} />
      <Input disabled className='mb-4' value={information?.identifier} />
      <Label text={t('credentials.detailed.credential_type')} />
      <div className='flex h-8 w-fit items-center justify-center gap-2 rounded-lg border-transparent bg-sky-500 px-2.5 py-1 text-sky-100'>
        <AcademicCapIcon className='h-5 w-6 text-sky-100' />
        <span>{t('credentials.detailed.diploma')}</span>
      </div>
    </div>
  );
};

export default CredentialInformation;
