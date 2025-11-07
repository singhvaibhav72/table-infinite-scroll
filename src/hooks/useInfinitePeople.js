import React from "react";
import generatePeople from "../utils/generatePeople";

const TOTAL = 10000;
const PAGE_SIZE = 500;

export default function useInfinitePeople() {
  const [pages, setPages] = React.useState([]);
  const [page, setPage] = React.useState(0);

  const [isInitialLoading, setIsInitialLoading] =
    React.useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] =
    React.useState(false);

  const hasMore = page * PAGE_SIZE < TOTAL;

  const loadMore = React.useCallback(() => {
    if (!hasMore) return;

    setIsFetchingNextPage(true);

    const next = page + 1;
    const start = (next - 1) * PAGE_SIZE;
    const end = Math.min(start + PAGE_SIZE, TOTAL);

    setTimeout(() => {
      const newPage = generatePeople(start, end);
      setPages((p) => [...p, newPage]);
      setPage(next);
      setIsFetchingNextPage(false);
      setIsInitialLoading(false);
    }, 600);
  }, [page, hasMore]);

  React.useEffect(() => {
    loadMore();
  }, []);

  const rows = React.useMemo(
    () => pages.flat(),
    [pages]
  );

  return {
    rows,
    hasMore,
    loadMore,
    isInitialLoading,
    isFetchingNextPage,
  };
}
