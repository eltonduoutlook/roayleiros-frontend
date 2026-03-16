import * as React from "react";
import {
    ColumnDef,
    PaginationState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight,
} from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    emptyMessage?: string;
    onRowClick?: (row: TData) => void;
    pageSizeOptions?: number[];
    initialPageSize?: number;
};

export function DataTable<TData, TValue>({
    columns,
    data,
    emptyMessage = "Nenhum registro encontrado.",
    onRowClick,
    pageSizeOptions = [10, 20, 30],
    initialPageSize,
}: DataTableProps<TData, TValue>) {
    const safeInitialPageSize =
        initialPageSize && pageSizeOptions.includes(initialPageSize)
            ? initialPageSize
            : pageSizeOptions[0] ?? 10;

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: safeInitialPageSize,
    });

    const table = useReactTable({
        data,
        columns,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const totalRows = data.length;
    const pageIndex = table.getState().pagination.pageIndex;
    const pageSize = table.getState().pagination.pageSize;
    const pageCount = table.getPageCount();

    const currentRows = table.getRowModel().rows.length;
    const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
    const endRow = totalRows === 0 ? 0 : startRow + currentRows - 1;

    function getVisiblePages(current: number, total: number) {
        const delta = 2
        const range: number[] = []

        for (
            let i = Math.max(1, current - delta);
            i <= Math.min(total, current + delta);
            i++
        ) {
            range.push(i)
        }

        if (range[0] > 2) {
            range.unshift(-1)
        }

        if (range[0] !== 1) {
            range.unshift(1)
        }

        if (range[range.length - 1] < total - 1) {
            range.push(-1)
        }

        if (range[range.length - 1] !== total) {
            range.push(total)
        }

        return range
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="whitespace-nowrap">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {currentRows > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className={onRowClick ? "cursor-pointer" : undefined}
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Itens por página
                        </span>

                        <Select
                            value={String(pageSize)}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                                table.setPageIndex(0);
                            }}
                        >
                            <SelectTrigger className="w-[90px]">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>

                            <SelectContent>
                                {pageSizeOptions.map((option) => (
                                    <SelectItem key={option} value={String(option)}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Mostrando {startRow} a {endRow} de {totalRows} registros
                    </div>

                    <div className="text-sm text-muted-foreground">
                        Página {pageCount === 0 ? 0 : pageIndex + 1} de {pageCount}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getVisiblePages(pageIndex + 1, pageCount).map((page, i) =>
                        page === -1 ? (
                            <span key={i} className="px-2 text-muted-foreground">
                                ...
                            </span>
                        ) : (
                            <Button
                                key={page}
                                type="button"
                                size="sm"
                                variant={page === pageIndex + 1 ? "secondary" : "outline"}
                                onClick={() => table.setPageIndex(page - 1)}
                                className="min-w-9"
                            >
                                {page}
                            </Button>
                        )
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => table.setPageIndex(pageCount - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}