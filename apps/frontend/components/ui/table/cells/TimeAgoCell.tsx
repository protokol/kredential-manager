import type { FC } from 'react';

import { shortTimeAgo } from '@utils/helpers/dateFormatting';

type TimeAgoCellProps = {
  value?: number;
};
const TimeAgoCell: FC<TimeAgoCellProps> = ({ value }) => {
  if (!value) return null;

  const dateObj = new Date(value * 1000);

  return shortTimeAgo(dateObj);
};

export default TimeAgoCell;
