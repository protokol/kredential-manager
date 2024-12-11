import type { FC } from 'react';

import Status from '@ui/Status';
import type { Variant } from '@ui/Status';

type StatusCellProps = {
  value?: Variant;
};

const StatusCell: FC<StatusCellProps> = ({ value }) => {
  if (!value) return null;

  return <Status variant={value} />;
};

export default StatusCell;
