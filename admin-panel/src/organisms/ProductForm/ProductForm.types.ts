export interface ProductFormValues {
  name: string;
  slug?: string | null;
  tagline?: string;
  category: string;
  material?: string;
  dimensions?: string;
  description: string;
  price: number;
  stock: number;
  whatsappNumber: string;
  imageUrl?: string | null;
  images?: { url: string }[];
  isActive?: boolean;
}
