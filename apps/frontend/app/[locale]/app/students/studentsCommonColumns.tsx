import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

// eslint-disable-next-line
const vcCommonColumnHelper = createColumnHelper<any>();

export const useStudentsColumns = () => {
  const t = useTranslations();

  return [
    vcCommonColumnHelper.accessor('displayName', {
      id: 'displayName',
      header: t('credentials.columns.name'),
      cell: ({ row }) => {
        const first_name = row?.original?.first_name;
        const last_name = row?.original?.last_name;
        const fullName = `${first_name} ${last_name}`;
        if (!first_name || !last_name) return null;

        return fullName;
      },
      enableSorting: false
    })
  ];
};
