export function parsePagination(query: any) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function withPaginationMeta<T>(items: T[], total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return { items, meta: { page, limit, total, totalPages } };
}
