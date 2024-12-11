import type { FC } from 'react';

import Badge from '@ui/badge/Badge';

type FilterValueBadgeProps = {
  label: string;
  value?: string | number;
};
const FilterValueBadge: FC<FilterValueBadgeProps> = ({ label, value }) => {
  if (!value) return null;

  return (
    <div>
      <Badge variant='gray'>{`${label}: ${value}`}</Badge>
    </div>
  );
};

export default FilterValueBadge;
