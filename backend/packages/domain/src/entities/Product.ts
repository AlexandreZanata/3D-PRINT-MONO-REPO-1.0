// @max-lines 200 — this is enforced by the lint pipeline.
import { PriceVO } from "../value-objects/PriceVO.js";
import { WhatsAppNumberVO } from "../value-objects/WhatsAppNumberVO.js";

export interface ProductProps {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: PriceVO;
  readonly stock: number;
  readonly whatsappNumber: WhatsAppNumberVO;
  readonly imageUrl: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

export interface CreateProductInput {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly whatsappNumber: string;
  readonly imageUrl?: string | null;
}

/** Product aggregate root. Constructed only via static factory. */
export class Product {
  private readonly props: ProductProps;

  private constructor(props: ProductProps) {
    this.props = props;
  }

  static create(input: CreateProductInput): Product {
    const now = new Date();
    return new Product({
      id: input.id,
      name: input.name.trim(),
      description: input.description.trim(),
      price: PriceVO.create(input.price),
      stock: input.stock,
      whatsappNumber: WhatsAppNumberVO.create(input.whatsappNumber),
      imageUrl: input.imageUrl ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static reconstitute(props: ProductProps): Product {
    return new Product(props);
  }

  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get description(): string {
    return this.props.description;
  }
  get price(): PriceVO {
    return this.props.price;
  }
  get stock(): number {
    return this.props.stock;
  }
  get whatsappNumber(): WhatsAppNumberVO {
    return this.props.whatsappNumber;
  }
  get imageUrl(): string | null {
    return this.props.imageUrl;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }
}
