import type { FC } from 'react';

import { formatShortDate } from '@utils/helpers/dateFormatting';

type DateCellProps = {
  value?: number;
};
const DateCell: FC<DateCellProps> = ({ value }) => {
  if (!value) return null;

  const dateObj = new Date(value * 1000);

  return formatShortDate(dateObj);
};

export default DateCell;
