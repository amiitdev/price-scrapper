import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, error: message, details },
    { status },
  );
}

export function apiPaginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    },
  });
}
