/**
 * Frontend domain types for the admin feature.
 */

export interface AuditLog {
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

export interface AuditLogList {
  readonly items: AuditLog[];
  readonly page: number;
  readonly limit: number;
  readonly total: number;
}

export interface CreateProductInput {
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly whatsappNumber: string;
  readonly imageUrl?: string | null;
}

export interface UpdateProductInput {
  readonly name?: string;
  readonly description?: string;
  readonly price?: number;
  readonly stock?: number;
  readonly whatsappNumber?: string;
  readonly imageUrl?: string | null;
  readonly isActive?: boolean;
}
