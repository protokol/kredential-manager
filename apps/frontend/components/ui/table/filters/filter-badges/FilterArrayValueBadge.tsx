import type { FC } from 'react';

import Badge from '@ui/badge/Badge';

type FilterArrayValueBadgeProps = {
  label: string;
  value?: string[];
};
const FilterArrayValueBadge: FC<FilterArrayValueBadgeProps> = ({
  label,
  value
}) => {
  if (!value?.length) return null;

  return (
    <div>
      <Badge variant='gray'>{`${label}: ${value?.join(', ')}`}</Badge>
    </div>
  );
};

export default FilterArrayValueBadge;
