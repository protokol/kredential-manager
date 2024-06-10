'use client';

import { useStudentsColumns } from './studentsCommonColumns';

import { useGetStudents } from '@utils/api/students/students.hook';

import PaginatedTable from '@ui/table/PaginatedTable';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

import ContentLayout from '@components/composed/layout/ContentLayout';

const StudentsPage = () => {
  const studentsColumns = useStudentsColumns();

  const {
    isLoading,
    data,
    tableConfig: { paginationConfig }
  } = useServerSideTableData({
    useDataHook: (apiParams) => useGetStudents({ ...apiParams })
  });

  return (
    <ContentLayout title='Students'>
      <div className='mb-6 text-lg font-bold text-sky-950'>Students List</div>

      <PaginatedTable
        isLoading={isLoading}
        columns={studentsColumns}
        paginationConfig={paginationConfig}
        data={data?.items ?? []}
      />
    </ContentLayout>
  );
};

export default StudentsPage;
