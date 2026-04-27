// @max-lines 200 — this is enforced by the lint pipeline.

/** Pagination metadata returned in list responses. */
export interface PaginatedMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
}

/** Successful API response envelope. */
export interface ApiSuccess<T> {
  readonly success: true;
  readonly data: T;
  readonly meta?: PaginatedMeta;
}

/** Error detail object inside an error envelope. */
export interface ApiErrorDetail {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

/** Failed API response envelope. */
export interface ApiError {
  readonly success: false;
  readonly error: ApiErrorDetail;
}

/** Union of all possible API response shapes. */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
