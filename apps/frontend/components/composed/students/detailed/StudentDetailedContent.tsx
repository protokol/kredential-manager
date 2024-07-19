'use client';

import { useTranslations } from 'next-intl';

import { useGetStudentById } from '@utils/api/students/students.hook';

import Spinner from '@ui/Spinner';
import Accordion from '@ui/accordion/Accordion';

const StudentDetailedContent = ({ studentId }: { studentId: string }) => {
  const t = useTranslations();

  const { isLoading } = useGetStudentById(studentId);

  return (
    <div>
      {isLoading ? (
        <div className='flex justify-center'>
          <Spinner />
        </div>
      ) : (
        <Accordion
          type='multiple'
          defaultValue={['1']}
          items={[
            {
              id: '1',
              title: t('credentials.detailed.information'),
              content: <div>info</div>
            }
          ]}
        />
      )}
    </div>
  );
};

export default StudentDetailedContent;
