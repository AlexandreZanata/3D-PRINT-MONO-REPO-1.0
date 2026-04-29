/**
 * Product domain type — mapped from API via ProductFacade.
 */
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly slug: string | null;
  readonly tagline: string;
  readonly category: string;
  readonly material: string;
  readonly dimensions: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly whatsappNumber: string;
  readonly imageUrl: string | null;
  readonly images: readonly string[];
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
}
