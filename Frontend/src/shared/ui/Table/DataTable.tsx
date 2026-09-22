import { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

export interface Column<T> {
    header: ReactNode;
    accessor?: keyof T;
    render?: (item: T) => ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
}

export function DataTable<T>({ data, columns, keyExtractor, emptyMessage = 'No data', onRowClick }: DataTableProps<T>) {
    if (data.length === 0) {
        return <div className="text-center py-20 text-secondary">{emptyMessage}</div>;
    }

    return (
        <div className="w-full overflow-x-auto custom-scrollbar border border-border rounded-2xl bg-surface/10">
            <div className="flex flex-col min-w-full">
                {/* Table Header */}
            <div className="hidden md:flex px-6 py-3 border-b border-border bg-surface/50 text-xs font-bold text-secondary uppercase tracking-wider">
                {columns.map((col, index) => (
                    <div key={index} className={cn("flex-1 min-w-0", col.className)}>
                        {col.header}
                    </div>
                ))}
            </div>
            
            {/* Table Body */}
            <div className="flex flex-col divide-y divide-border/50">
                {data.map((row) => (
                    <div 
                        key={keyExtractor(row)} 
                        onClick={() => onRowClick?.(row)}
                        className={cn(
                            "flex flex-col md:flex-row px-6 py-4 items-center transition-colors group",
                            onRowClick ? "cursor-pointer hover:bg-surface/30" : "hover:bg-surface/10"
                        )}
                    >
                        {columns.map((col, index) => (
                            <div key={index} className={cn("flex-1 min-w-0 w-full md:w-auto mt-2 md:mt-0", col.className)}>
                                {col.render ? col.render(row) : String(row[col.accessor as keyof T])}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            </div>
        </div>
    );
}
    