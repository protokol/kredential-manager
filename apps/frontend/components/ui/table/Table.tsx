'use client';

import type {
  Column,
  ColumnDef,
  ColumnOrderState,
  ColumnPinningState,
  OnChangeFn,
  SortingState
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect, useState } from 'react';

import { cn } from '@utils/cn';

import Spinner from '@ui/Spinner';
import withErrorBoundary from '@ui/error-boundary/withErrorBoundary';
import * as Table from '@ui/table/Table.components';
import { TablePinAction } from '@ui/table/Table.components';
import { useTableStorage } from '@ui/table/useTableStorage';

export type TableProps<TData extends object> = {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  columns: ColumnDef<TData, any>[]; // Explicit any type is acceptable here, so it works with enums and numbers
  data: TData[];
  isLoading?: boolean;
  name?: string;
  placeholder?: ReactNode;
  onRowClick?: (row: TData) => void;
  sortConfig?: {
    sorting?: SortingState;
    setSorting?: OnChangeFn<SortingState>;
  };
};

const TableComponent = <TData extends object>({
  name,
  columns,
  data,
  isLoading,
  placeholder = 'No data to display',
  onRowClick,
  sortConfig
}: TableProps<TData>) => {
  const { tableStorage, onTableStorageChange } = useTableStorage(name);

  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    tableStorage.columnOrder
  );

  const columnsWithEnabledFeatures = columns.map((column) => ({
    enableSorting: true,
    enablePinning: true,
    ...column
  }));

  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: tableStorage.columnPinning?.left?.length
      ? tableStorage.columnPinning?.left
      : getPinnedColumnIds(columnsWithEnabledFeatures, 'left'),
    right: tableStorage.columnPinning?.right?.length
      ? tableStorage.columnPinning?.right
      : getPinnedColumnIds(columnsWithEnabledFeatures, 'right')
  });

  const {
    getRowModel,
    getAllColumns,
    getColumn,
    getHeaderGroups,
    setColumnOrder: setTableColumnOrder
  } = useReactTable({
    data,
    columns: columnsWithEnabledFeatures,
    onSortingChange: sortConfig?.setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting: sortConfig?.sorting,
      columnOrder,
      columnPinning
    }
  });

  useEffect(() => {
    onTableStorageChange({
      columnOrder,
      columnPinning: {
        left: columnPinning.left,
        right: columnPinning.right
      }
    });
  }, [columnOrder, columnPinning, onTableStorageChange]);

  const tableRows = getRowModel().rows;

  // Logic finds next column that is not pinned and swaps it with the current column
  const changeColumnOrder = useCallback(
    (columnId: string, direction: 'left' | 'right') => {
      const orderExists = Boolean(columnOrder.length);

      const newColumnOrder = orderExists
        ? [...columnOrder]
        : [...getAllColumns().map((column) => column.id)];

      const columnIndex = newColumnOrder.indexOf(columnId);
      if (columnIndex === -1) return newColumnOrder;

      const findNextIndexOfNonPinnedColumn = () => {
        if (direction === 'left') {
          for (let i = columnIndex - 1; i >= 0; i--) {
            const tableColumn = getColumn(newColumnOrder[i]);
            const columnId = tableColumn?.id ?? '';

            if (!tableColumn?.getIsPinned()) {
              return newColumnOrder.indexOf(columnId);
            }
          }

          return columnIndex;
        }

        for (let i = columnIndex + 1; i < newColumnOrder.length; i++) {
          const tableColumn = getColumn(newColumnOrder[i]);
          const columnId = tableColumn?.id ?? '';

          if (!tableColumn?.getIsPinned()) {
            return newColumnOrder.indexOf(columnId);
          }
        }

        return columnIndex;
      };

      const newIndex = findNextIndexOfNonPinnedColumn();

      const [removedColumn] = newColumnOrder.splice(columnIndex, 1);
      newColumnOrder.splice(newIndex, 0, removedColumn);

      setTableColumnOrder(newColumnOrder);
      setColumnOrder(newColumnOrder);
    },
    [columnOrder, getAllColumns, getColumn, setTableColumnOrder]
  );

  // Logic finds pinned column and swaps it with the next or previous column
  const setPinOrder = useCallback(
    (columnId: string, direction: 'left' | 'right') => {
      const column = getColumn(columnId);
      const columnPinned = column?.getIsPinned();
      if (!columnPinned) return;
      const arrayToMutate = columnPinning[columnPinned];
      if (!arrayToMutate) return;
      const currentIndex = arrayToMutate?.indexOf(columnId);
      if (currentIndex === -1) return;

      const newIndex =
        direction === 'left' ? currentIndex - 1 : currentIndex + 1;

      const newColumnPinning = [...arrayToMutate];
      const [removedColumn] = newColumnPinning.splice(currentIndex, 1);
      newColumnPinning.splice(newIndex, 0, removedColumn);

      setColumnPinning({
        ...columnPinning,
        [columnPinned]: newColumnPinning
      });
    },
    [columnPinning, getColumn]
  );

  return (
    <div className='shadow-1 overflow-hidden rounded-md border-1.5 border-slate-200'>
      <Table.TableRoot>
        <Table.TableHeader>
          {getHeaderGroups().map((headerGroup) => (
            <Table.TableRow
              key={headerGroup.id}
              className='hover:bg-inherit border-b-1.5 border-b-slate-200'
            >
              {headerGroup.headers.map((header, index) => {
                const isSorted = header.column.getIsSorted();
                const isPinned = header.column.getIsPinned();

                const prevColumn = headerGroup.headers[index - 1];
                const nextColumn = headerGroup.headers[index + 1];
                const preventUnpinning = Boolean(
                  header.column.columnDef?.meta?.preventUnpinning
                );

                const unpinFn = preventUnpinning
                  ? undefined
                  : () => {
                      header.column.pin(false);
                    };

                const pinStyles = getPinOffset<TData>(
                  header.column,
                  columnPinning
                );

                return (
                  <Table.TableHead
                    key={header.id}
                    style={pinStyles}
                    className={cn({
                      'bg-slate-200': isSorted,
                      'w-50 min-w-50 max-w-50 sticky truncate': isPinned
                    })}
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <span className='min-w-0 truncate'>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </span>
                      <div className='flex items-center'>
                        {isPinned && !preventUnpinning && (
                          <TablePinAction unpin={unpinFn} />
                        )}
                        {!header.column.columnDef?.meta?.hideActions && (
                          <Table.TableHeaderActions
                            columnCount={columns.length}
                            columnIndex={header.index}
                            setPinOrder={setPinOrder}
                            setColumnOrder={changeColumnOrder}
                            column={header.column}
                            preventUnpinning={preventUnpinning}
                            prevColumn={prevColumn?.column}
                            nextColumn={nextColumn?.column}
                          />
                        )}
                      </div>
                    </div>
                  </Table.TableHead>
                );
              })}
            </Table.TableRow>
          ))}
        </Table.TableHeader>
        <Table.TableBody>
          {!isLoading &&
            Boolean(tableRows.length) &&
            tableRows.map((row) => (
              <Table.TableRow
                key={row.id}
                onClick={() => {
                  onRowClick?.(row.original);
                }}
                className={cn({
                  group: Boolean(onRowClick)
                })}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => {
                  const isPinned = cell.column.getIsPinned();

                  const pinStyles = getPinOffset<TData>(
                    cell.column,
                    columnPinning
                  );

                  return (
                    <Table.TableCell
                      key={cell.id}
                      style={pinStyles}
                      className={cn('whitespace-nowrap bg-white', {
                        'w-50 min-w-50 max-w-50 sticky truncate': isPinned,
                        'cursor-pointer group-hover:bg-red-500':
                          Boolean(onRowClick)
                      })}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.TableCell>
                  );
                })}
              </Table.TableRow>
            ))}

          {!isLoading && !tableRows.length && (
            <Table.TableRow className='py-20'>
              <Table.TableCell
                colSpan={columns.length}
                className='h-24 bg-white py-10'
              >
                <div className='flex items-center justify-center text-center text-slate-500'>
                  {placeholder}
                </div>
              </Table.TableCell>
            </Table.TableRow>
          )}

          {isLoading && (
            <Table.TableRow className='py-20'>
              <Table.TableCell colSpan={columns.length} className='h-24'>
                <div className='flex justify-center'>
                  <Spinner />
                </div>
              </Table.TableCell>
            </Table.TableRow>
          )}
        </Table.TableBody>
      </Table.TableRoot>
    </div>
  );
};

export default memo(withErrorBoundary(TableComponent)) as typeof TableComponent;

const getPinnedColumnIds = <TData extends object>(
  columns: ColumnDef<TData>[],
  direction: 'left' | 'right'
) =>
  columns
    .filter(
      (column) => column.enablePinning && column.meta?.pinned === direction
    )
    .map((column) => column.id)
    .filter(Boolean);

const getPinOffset = <TData extends object>(
  column: Column<TData>,
  columnPinning: ColumnPinningState
) => {
  const isPinned = column.getIsPinned();
  if (!isPinned || !columnPinning[isPinned]) return {};

  const isPinnedLeft = isPinned === 'left';
  const isPinnedRight = isPinned === 'right';

  const columnPinState = columnPinning[isPinned];

  let styles = {};
  const pinIndex = columnPinState?.indexOf(column.id) || 0;

  if (isPinnedLeft) {
    styles = {
      left: `${pinIndex * 200}px`
    };
  }

  if (isPinnedRight) {
    const reversePinIndex = (columnPinState?.length || 0) - pinIndex - 1;

    styles = {
      right: `${reversePinIndex * 200}px`
    };
  }

  return styles;
};
