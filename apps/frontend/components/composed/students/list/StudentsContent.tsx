'use client';

import { useStudentsColumns } from '../studentsCommonColumns';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

import { useRouter } from '@navigation';

import { useGetStudents } from '@utils/api/students/students.hook';
import { routes } from '@utils/routes';

import InputWithIcon from '@ui/InputWithIcon';
import PaginatedTable from '@ui/table/PaginatedTable';
import useServerSideTableData from '@ui/table/hooks/useServerSideTableData';

const StudentsContent = () => {
  const studentsColumns = useStudentsColumns();
  const t = useTranslations();
  const { push } = useRouter();

  const {
    isLoading,
    data,
    tableConfig: { paginationConfig }
  } = useServerSideTableData({
    useDataHook: (apiParams) => useGetStudents({ ...apiParams })
  });

  return (
    <div>
      <div className='mb-6 text-lg font-bold text-sky-950'>Students List</div>
      <div className='my-6 flex justify-between'>
        <div className='min-w-64'>
          <InputWithIcon
            type='text'
            icon={MagnifyingGlassIcon}
            autoComplete='off'
            placeholder={t('students.search_by_name')}
          />
        </div>
      </div>

      <PaginatedTable
        isLoading={isLoading}
        columns={studentsColumns}
        onRowClick={(rowData) => {
          push(routes.app.students.view(String(rowData.student_id)));
        }}
        paginationConfig={paginationConfig}
        data={data?.items ?? []}
      />
    </div>
  );
};

export default StudentsContent;
