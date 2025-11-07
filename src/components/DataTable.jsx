import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import useInfinitePeople from "../hooks/useInfinitePeople";

const columnHelper = createColumnHelper();

// Column defs (all text inputs for simplicity)
const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    size: 80,
    enableColumnFilter: true,
  }),
  columnHelper.accessor("name", {
    header: "Name",
    enableColumnFilter: true,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    enableColumnFilter: true,
  }),
  columnHelper.accessor("age", {
    header: "Age",
    size: 80,
    enableColumnFilter: true,
  }),
  columnHelper.accessor("city", {
    header: "City",
    enableColumnFilter: true,
  }),
];

const ROW_HEIGHT = 44;
const TABLE_HEIGHT = 600;
const OVERSCAN = 10;

export default function DataTable() {
  const {
    rows: rawRows,
    hasMore,
    loadMore,
    isInitialLoading,
    isFetchingNextPage,
  } = useInfinitePeople();

  // table state
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);

  const table = useReactTable({
    data: rawRows,
    columns,
    state: { sorting, globalFilter, columnFilters },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // default string filtering behavior (case-insensitive includes)
    globalFilterFn: "includesString",
  });

  const tableRows = table.getRowModel().rows;

  // virtualization
  const parentRef = React.useRef(null);
  const totalCount = tableRows.length + (isFetchingNextPage ? 10 : 0);

  const rowVirtualizer = useVirtualizer({
    count: totalCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  // infinite scroll trigger
  React.useEffect(() => {
    const items = rowVirtualizer.getVirtualItems();
    const last = items[items.length - 1];
    if (!last) return;

    const nearEnd = last.index >= tableRows.length - 5;
    if (nearEnd && hasMore && !isFetchingNextPage) {
      loadMore();
    }
  }, [
    rowVirtualizer.getVirtualItems(),
    tableRows.length,
    hasMore,
    isFetchingNextPage,
    loadMore,
  ]);

  return (
    <div className="card">
      {/* Global filter */}
      <div className="toolbar">
        <input
          className="input"
          placeholder="Global search…"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <div className="hint">Click headers to sort</div>
      </div>

      <div className="table">
        {/* Header row (click to sort) */}
        <div className="thead">
          {table.getHeaderGroups().map((hg) => (
            <div key={hg.id} className="tr tr--head">
              {hg.headers.map((header) => {
                if (header.isPlaceholder) return <div key={header.id} className="th" />;
                const col = header.column;
                const dir = col.getIsSorted(); // 'asc' | 'desc' | false
                return (
                  <div key={header.id} className="th">
                    <button
                      className="th__btn"
                      onClick={col.getToggleSortingHandler()}
                      title="Click to sort"
                    >
                      {flexRender(col.columnDef.header, header.getContext())}
                      <span className="th__sort">
                        {dir === "asc" ? " ▲" : dir === "desc" ? " ▼" : ""}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Column filter inputs */}
          <div className="tr tr--filters">
            {table.getFlatHeaders().map((header) => {
              const col = header.column;
              if (!col.getCanFilter()) {
                return <div key={header.id} className="th" />;
              }
              const v = col.getFilterValue() ?? "";
              return (
                <div key={header.id} className="th">
                  <input
                    className="filter"
                    value={v}
                    onChange={(e) => col.setFilterValue(e.target.value)}
                    placeholder={`Filter ${String(col.id)}…`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Virtualized body */}
        <div className="tbody" ref={parentRef} style={{ height: TABLE_HEIGHT }}>
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((vi) => {
              const isSkeleton = vi.index >= tableRows.length;
              const row = tableRows[vi.index];

              return (
                <div
                  key={vi.key}
                  className={`tr ${isSkeleton ? "tr--skeleton" : ""}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transform: `translateY(${vi.start}px)`,
                    height: vi.size,
                    width: "100%",
                  }}
                >
                  {isSkeleton ? (
                    <SkeletonRow colCount={columns.length} />
                  ) : (
                    row.getVisibleCells().map((cell) => (
                      <div key={cell.id} className="td">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="statusbar">
        Loaded rows: <strong>{rawRows.length}</strong>
      </div>
    </div>
  );
}

function SkeletonRow({ colCount }) {
  return (
    <>
      {Array.from({ length: colCount }).map((_, i) => (
        <div key={i} className="td">
          <div className="skeleton" />
        </div>
      ))}
    </>
  );
}
