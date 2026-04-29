import type { JsonValue } from "@/lib/jsonValue";

export interface AuditLog {
  readonly id: string;
  readonly adminId: string;
  readonly action: string;
  readonly entity: string;
  readonly entityId: string;
  readonly payload: JsonValue;
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
  readonly slug?: string | null;
  readonly tagline?: string;
  readonly category?: string;
  readonly material?: string;
  readonly dimensions?: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly whatsappNumber: string;
  readonly imageUrl?: string | null;
  readonly images?: readonly string[];
}

export interface UpdateProductInput {
  readonly name?: string;
  readonly slug?: string | null;
  readonly tagline?: string;
  readonly category?: string;
  readonly material?: string;
  readonly dimensions?: string;
  readonly description?: string;
  readonly price?: number;
  readonly stock?: number;
  readonly whatsappNumber?: string;
  readonly imageUrl?: string | null;
  readonly images?: readonly string[];
  readonly isActive?: boolean;
}
