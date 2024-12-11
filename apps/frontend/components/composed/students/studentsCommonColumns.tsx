import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

import DateCell from '@ui/table/cells/DateCell';

// eslint-disable-next-line
const vcCommonColumnHelper = createColumnHelper<any>();

export const useStudentsColumns = () => {
  const t = useTranslations();

  return [
    vcCommonColumnHelper.accessor('displayName', {
      id: 'displayName',
      header: t('students.columns.name'),
      cell: ({ row }) => {
        const first_name = row?.original?.first_name;
        const last_name = row?.original?.last_name;
        const fullName = `${first_name} ${last_name}`;
        if (!first_name || !last_name) return null;

        return fullName;
      },
      enableSorting: false
    }),
    vcCommonColumnHelper.accessor('date_of_birth', {
      id: 'created_at',
      header: t('students.columns.date_of_birth'),
      cell: ({ getValue }) => <DateCell value={getValue()} />,
      enableSorting: false
    })
  ];
};
