import type { ColumnMeta as Meta, RowData } from '@tanstack/react-table';
import type { ColumnPinningPosition } from '@tanstack/table-core/src/features/Pinning';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue>
    extends Meta<TData, TValue> {
    hideActions?: boolean;
    pinned?: ColumnPinningPosition;
    preventUnpinning?: boolean;
  }
}
