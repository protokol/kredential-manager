import type { FC } from 'react';

import { formatNumber } from '@utils/helpers/numberFormatting';

type NumberCellProps = {
  value?: number;
};
const NumberCell: FC<NumberCellProps> = ({ value }) => {
  if (!value) return null;

  return formatNumber(value);
};

export default NumberCell;
