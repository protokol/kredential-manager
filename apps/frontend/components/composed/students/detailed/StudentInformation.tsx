import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { formatShortDate } from '@utils/helpers/dateFormatting';

import Input from '@ui/Input';

type TStudent = {
  first_name: string;
  last_name: string;
  date_of_birth: Date | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dids?: any[];
};

const Label = ({ text }: { text: string }) => (
  <div className='mb-2 text-sm text-slate-500'>{text}</div>
);

const StudentInformation = ({ student }: { student: TStudent }) => {
  const t = useTranslations();

  const didList = useMemo(
    () =>
      student?.dids
        ?.map((item) => `${item.identifier.slice(0, 15)}...`)
        .join(', '),
    [student.dids]
  );

  return (
    <div>
      <Label text={t('students.detailed.full_name')} />
      <Input
        disabled
        className='mb-4'
        value={`${student.first_name} ${student.last_name}`}
      />
      {student?.date_of_birth && (
        <>
          <Label text={t('students.detailed.date_of_birth')} />
          <Input
            disabled
            className='mb-4'
            value={formatShortDate(student?.date_of_birth) || 'N/A'}
          />
        </>
      )}
      <Label text={t('students.detailed.address')} />
      <Input disabled className='mb-4' value='N/A' />
      <Label text={t('students.detailed.ebsi_id')} />
      <Input disabled className='mb-4' value={didList} />
      <Label text={t('students.detailed.issued_credentials')} />
      <div className='flex h-8 w-fit items-center justify-center gap-2 rounded-lg border-transparent bg-sky-500 px-2.5 py-1 text-sky-100'>
        <AcademicCapIcon className='h-5 w-6 text-sky-100' />
        <span>{t('students.detailed.diploma')}</span>
      </div>
    </div>
  );
};

export default StudentInformation;
