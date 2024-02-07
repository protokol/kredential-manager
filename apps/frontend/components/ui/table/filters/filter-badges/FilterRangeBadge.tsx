import type { FC } from 'react';
import { useMemo } from 'react';

import Badge from '@ui/badge/Badge';

type FilterRangeBadgeProps = {
  label: string;
  from?: number;
  to?: number;
};
const FilterRangeBadge: FC<FilterRangeBadgeProps> = ({ label, from, to }) => {
  const value = useMemo(() => {
    if (from && to) {
      return `${from} - ${to}`;
    }
    if (from) {
      return `> ${from}`;
    }
    if (to) {
      return `< ${to}`;
    }

    return '';
  }, [from, to]);

  if (!from && !to) return null;
  return (
    <div>
      <Badge variant='gray'>{`${label}: ${value}`}</Badge>
    </div>
  );
};

export default FilterRangeBadge;
