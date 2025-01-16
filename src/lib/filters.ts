import type { TaskPriority, TaskStatus, TaskType } from "@prisma/client";

export interface Filter {
  query: string;
  page: number;
  limit: number;
  orderBy: "createdAt" | "updatedAt" | "id";
  order: "asc" | "desc";
}

export interface TaskFilter extends Filter {
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export interface FilterOptions {
  query?: string;
  page?: number;
  limit?: number;
  orderBy?: "createdAt" | "updatedAt" | "id";
  order?: "asc" | "desc";
}

export interface TaskFilterOptions extends FilterOptions {
  type?: TaskType;
  status?: TaskStatus;
  priority?: TaskPriority;
}

const DEFAULT_SORT_BY = "createdAt";
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;
const DEFAULT_ORDER = "desc";

export function getDefaultFilter({
  query = "",
  orderBy = DEFAULT_SORT_BY,
  limit = DEFAULT_LIMIT,
  page = DEFAULT_PAGE,
  order = DEFAULT_ORDER,
}: FilterOptions): Filter {
  return {
    query,
    page,
    limit,
    orderBy,
    order,
  };
}

export function getDefaultTaskFilters({
  query = "",
  orderBy = DEFAULT_SORT_BY,
  limit = DEFAULT_LIMIT,
  page = DEFAULT_PAGE,
  order = DEFAULT_ORDER,
  type,
  status,
  priority,
}: TaskFilterOptions): TaskFilter {
  return {
    query,
    page,
    limit,
    orderBy,
    order,
    type,
    status,
    priority,
  };
}
