'use client';

import type { FC } from 'react';

import * as Select from '@ui/Select/Select.components';

export type SelectMenuProps = {
  placeholder?: string;
  items: SelectMenuItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

export type SelectMenuItem = {
  value: string;
  label: string;
  disabled?: boolean;
};
const SelectMenu: FC<SelectMenuProps> = ({
  placeholder,
  disabled,
  onValueChange,
  value,
  items,
  className
}) => (
  <Select.SelectRoot
    onValueChange={onValueChange}
    disabled={disabled}
    value={value}
  >
    <Select.SelectTrigger className={className}>
      <Select.SelectValue placeholder={placeholder} />
    </Select.SelectTrigger>
    <Select.SelectContent>
      {items.map((item) => (
        <Select.SelectItem
          key={item.value}
          value={item.value}
          disabled={item?.disabled}
        >
          {item.label}
        </Select.SelectItem>
      ))}
    </Select.SelectContent>
  </Select.SelectRoot>
);

SelectMenu.displayName = 'Select';

export default SelectMenu;
