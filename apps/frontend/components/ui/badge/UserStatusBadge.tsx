import type { FC } from 'react';

import type { BadgeVariants } from '@ui/badge/Badge';
import Badge from '@ui/badge/Badge';

const statusToVariant: Record<string, BadgeVariants> = {
  active: 'green',
  pending: 'yellow',
  deactivated: 'red',
  deleted: 'red'
};

type UserStatusBadgeProps = {
  value?: 'active' | 'pending' | 'deactivated' | 'deleted';
};
const UserStatusBadge: FC<UserStatusBadgeProps> = ({ value }) => {
  if (!value || !statusToVariant[value]) return null;

  return (
    <Badge variant={statusToVariant[value]} className='uppercase'>
      {value}
    </Badge>
  );
};

export default UserStatusBadge;
