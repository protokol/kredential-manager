import type { FC } from 'react';

const toTitleCase = (str: string) =>
  str.replace(/\b\w/g, (char: string) => char.toUpperCase());

type TitleCellProps = {
  value?: string;
};

const TitleCell: FC<TitleCellProps> = ({ value }) => {
  if (!value) return 'N/A';

  return toTitleCase(value);
};

export default TitleCell;
