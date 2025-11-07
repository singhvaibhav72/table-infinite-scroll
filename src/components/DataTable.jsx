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

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    size: 80,
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("email", {
    header: "Email",
  }),
  columnHelper.accessor("age", {
    header: "Age",
    size: 80,
  }),
  columnHelper.accessor("city", {
    header: "City",
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

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState([]);

  const table = useReactTable({
    data: rawRows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const tableRows = table.getRowModel().rows;

  const parentRef = React.useRef(null);
  const totalCount =
    tableRows.length + (isFetchingNextPage ? 10 : 0);

  const rowVirtualizer = useVirtualizer({
    count: totalCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  // Infinite scroll
  React.useEffect(() => {
    const last = rowVirtualizer.getVirtualItems().at(-1);
    if (!last) return;

    if (
      last.index >= tableRows.length - 5 &&
      hasMore &&
      !isFetchingNextPage
    ) {
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
      <div className="toolbar">
        <input
          className="input"
          placeholder="Search…"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      <div className="table">
        <div className="thead">
          {table.getHeaderGroups().map((hg) => (
            <div key={hg.id} className="tr tr--head">
              {hg.headers.map((header) => (
                <div
                  key={header.id}
                  className="th"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div
          className="tbody"
          ref={parentRef}
          style={{ height: TABLE_HEIGHT }}
        >
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
        Loaded rows: {rawRows.length}
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
