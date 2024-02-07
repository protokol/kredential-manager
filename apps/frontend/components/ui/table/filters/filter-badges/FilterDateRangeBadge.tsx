import type { FC } from 'react';
import { useMemo } from 'react';

import { formatShortDate } from '@utils/helpers/dateFormatting';

import Badge from '@ui/badge/Badge';

type FilterDateRangeBadgeProps = {
  label: string;
  from?: number;
  to?: number;
};
const FilterDateRangeBadge: FC<FilterDateRangeBadgeProps> = ({
  label,
  from,
  to
}) => {
  const value = useMemo(() => {
    if (from && to) {
      return `${formatShortDate(new Date(from * 1000))} - ${formatShortDate(
        new Date(to * 1000)
      )}`;
    }
    if (from) {
      return `> ${formatShortDate(new Date(from * 1000))}`;
    }
    if (to) {
      return `< ${formatShortDate(new Date(to * 1000))}`;
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

export default FilterDateRangeBadge;
