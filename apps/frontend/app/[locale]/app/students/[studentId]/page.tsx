'use client';

import { useTranslations } from 'next-intl';
import type { FC } from 'react';

import ContentLayout from '@components/composed/layout/ContentLayout';
import StudentDetailedContent from '@components/composed/students/detailed/StudentDetailedContent';

type StudentDetailedPageProps = {
  params: {
    studentId: string;
  };
};

const StudentDetailedPage: FC<StudentDetailedPageProps> = ({
  params: { studentId }
}: StudentDetailedPageProps) => {
  const t = useTranslations();

  return (
    <ContentLayout title={t('students.title')}>
      <StudentDetailedContent studentId={studentId} />
    </ContentLayout>
  );
};

export default StudentDetailedPage;
