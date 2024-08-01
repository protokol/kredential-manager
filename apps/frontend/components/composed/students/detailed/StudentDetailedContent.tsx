'use client';

import StudentInformation from './StudentInformation';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useGetStudentById } from '@utils/api/students/students.hook';

import Spinner from '@ui/Spinner';
import Accordion from '@ui/accordion/Accordion';

const StudentDetailedContent = ({ studentId }: { studentId: string }) => {
  const t = useTranslations();

  const { data: studentData, isLoading } = useGetStudentById(studentId);

  const fullName = useMemo(
    () => `${studentData?.first_name} ${studentData?.last_name}`,
    [studentData]
  );

  return (
    <div>
      {isLoading ? (
        <div className='flex justify-center'>
          <Spinner />
        </div>
      ) : (
        <div>
          <div className='mb-6 text-lg font-bold text-sky-950'>{fullName}</div>
          <Accordion
            type='multiple'
            defaultValue={['1']}
            items={[
              {
                id: '1',
                title: t('credentials.detailed.information'),
                content: (
                  <>
                    {studentData && (
                      <StudentInformation student={studentData} />
                    )}
                  </>
                )
              }
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default StudentDetailedContent;
