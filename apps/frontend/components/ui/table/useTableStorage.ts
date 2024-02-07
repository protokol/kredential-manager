'use client';

import type {
  ColumnOrderState,
  ColumnPinningState
} from '@tanstack/react-table';
import { useCallback } from 'react';
import z from 'zod';

const tableStorageSchema = z.object({
  columnOrder: z.array(z.string()),
  columnPinning: z.object({
    left: z.array(z.string()),
    right: z.array(z.string())
  })
});

export type tableStorageType = {
  columnOrder: ColumnOrderState;
  columnPinning: ColumnPinningState;
};

const emptyState: tableStorageType = {
  columnOrder: [],
  columnPinning: {
    left: [],
    right: []
  }
};

export const useTableStorage = (tableName?: string) => {
  const getTableStorage = useCallback(() => {
    if (!tableName) return emptyState;

    const tableStorage = localStorage.getItem(tableName);

    if (tableStorage) {
      const rows = JSON.parse(tableStorage);
      return tableStorageSchema.parse(rows);
    }

    return emptyState;
  }, [tableName]);

  const onTableStorageChange = useCallback(
    (data: {
      columnOrder: ColumnOrderState;
      columnPinning: ColumnPinningState;
    }) => {
      if (!tableName) return;
      localStorage.setItem(tableName, JSON.stringify(data));
    },
    [tableName]
  );

  return {
    tableStorage: getTableStorage(),
    onTableStorageChange
  };
};
