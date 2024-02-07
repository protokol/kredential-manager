'use client';

import type { FC } from 'react';
import { memo, useEffect, useState } from 'react';

import Input from '@ui/Input';
import SliderRange from '@ui/slider/SliderRange';
import type { FilterWrapperProps } from '@ui/table/filters/FilterWrapper';
import FilterWrapper from '@ui/table/filters/FilterWrapper';
import Text from '@ui/typography/Text';

export type FilterRangeValue = {
  min?: number;
  max?: number;
};

type FilterRangeProps = FilterWrapperProps & {
  type?: 'integer' | 'double';
  minRange: number;
  maxRange: number;
  minValue?: number;
  maxValue?: number;
  onChange: (value?: FilterRangeValue) => void;
  description?: string;
};
const FilterRange: FC<FilterRangeProps> = ({
  type = 'double',
  minRange,
  maxRange,
  minValue,
  maxValue,
  onChange,
  description,
  ...wrapperProps
}) => {
  const [minState, setMinState] = useState(minValue ?? minRange);
  const [maxState, setMaxState] = useState(maxValue ?? maxRange);

  const min = minValue ?? minRange;
  const max = maxValue ?? maxRange;

  const onBlur = () => {
    if (minState > maxState || minState < minRange || maxState > maxRange) {
      setMinState(min);
      setMaxState(max);
      return;
    }
    if (minState === min && maxState === max) {
      onChange(undefined);
      return;
    }

    onChange({ min: minState, max: maxState });
  };

  useEffect(() => {
    setMinState(minValue ?? minRange);
  }, [minRange, minValue]);

  useEffect(() => {
    setMaxState(maxValue ?? maxRange);
  }, [maxRange, maxValue]);

  return (
    <FilterWrapper
      {...wrapperProps}
      clear={() => {
        onChange(undefined);
      }}
    >
      <div className='h-full w-full min-w-64 space-y-4 bg-white p-4'>
        {description && (
          <>
            <div>
              <Text className='-my-2 text-sm font-medium text-slate-500'>
                {description}
              </Text>
            </div>
            <div className='-mx-4 border-b border-slate-200' />
          </>
        )}

        <div className='flex justify-between gap-4'>
          <Input
            value={minState}
            className='w-24'
            type='number'
            placeholder='Min'
            onBlur={onBlur}
            onChange={(e) => {
              const inputNumber = Number(e.target.value);
              const minInputValue =
                type === 'integer' ? Math.trunc(inputNumber) : inputNumber;
              setMinState(minInputValue);
            }}
          />

          <Input
            value={maxState}
            className='w-24 text-right'
            type='number'
            placeholder='Max'
            onBlur={onBlur}
            onChange={(e) => {
              const inputNumber = Number(e.target.value);
              const maxInputValue =
                type === 'integer' ? Math.trunc(inputNumber) : inputNumber;
              setMaxState(maxInputValue);
            }}
          />
        </div>
        <SliderRange
          min={minRange}
          max={maxRange}
          value={[min, max]}
          onValueChange={([min, max]) => {
            onChange({ min, max });
          }}
        />
      </div>
    </FilterWrapper>
  );
};

export default memo(FilterRange);
