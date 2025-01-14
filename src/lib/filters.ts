export interface Filter {
  query: string;
  page: number;
  limit: number;
  orderBy: "createdAt" | "updatedAt" | "id";
  order: "asc" | "desc";
}

export interface FilterOptions {
  query?: string;
  page?: number;
  limit?: number;
  orderBy?: "createdAt" | "updatedAt" | "id";
  order?: "asc" | "desc";
}

const DEFAULT_SORT_BY = "id";
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;
const DEFAULT_ORDER = "desc";

export function getDefaultFilter({
  query = "",
  sortBy = DEFAULT_SORT_BY,
  limit = DEFAULT_LIMIT,
  page = DEFAULT_PAGE,
  order = DEFAULT_ORDER,
}: {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "id";
  order?: "asc" | "desc";
}): Filter {
  return {
    query,
    page,
    limit,
    orderBy: sortBy,
    order,
  };
}
