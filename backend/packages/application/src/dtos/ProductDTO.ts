// @max-lines 200 — this is enforced by the lint pipeline.

/** Serialisable product shape returned by all use cases. */
export interface ProductDTO {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly whatsappNumber: string;
  readonly imageUrl: string | null;
  readonly isActive: boolean;
  readonly createdAt: string; // ISO 8601
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}

/** Serialisable audit log entry. */
export interface AuditLogDTO {
  readonly id: string;
  readonly adminId: string;
  readonly action: string;
  readonly entity: string;
  readonly entityId: string;
  readonly payload: Record<string, unknown>;
  readonly ip: string;
  readonly ua: string;
  readonly createdAt: string;
}

/** Auth token pair returned after login / refresh. */
export interface TokenPairDTO {
  readonly accessToken: string;
  readonly refreshToken: string;
}
