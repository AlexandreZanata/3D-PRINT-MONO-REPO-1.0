// @max-lines 200 — this is enforced by the lint pipeline.
import type { CreateProductDTO, ListProductsQueryDTO, UpdateProductDTO } from "@repo/contracts";
import type { Result } from "@repo/utils";
import type { ProductDTO } from "../dtos/ProductDTO.js";
import type { ListProductsResult } from "../use-cases/product/ListProductsUseCase.js";
import type { WhatsAppLinkResult } from "../use-cases/product/GetWhatsAppLinkUseCase.js";
import type { CreateProductUseCase } from "../use-cases/product/CreateProductUseCase.js";
import type { DeleteProductUseCase } from "../use-cases/product/DeleteProductUseCase.js";
import type { GetProductByIdUseCase } from "../use-cases/product/GetProductByIdUseCase.js";
import type { GetWhatsAppLinkUseCase } from "../use-cases/product/GetWhatsAppLinkUseCase.js";
import type { ListProductsUseCase } from "../use-cases/product/ListProductsUseCase.js";
import type { UpdateProductUseCase } from "../use-cases/product/UpdateProductUseCase.js";

export interface ProductFacadeDeps {
  readonly listProducts: ListProductsUseCase;
  readonly getProductById: GetProductByIdUseCase;
  readonly createProduct: CreateProductUseCase;
  readonly updateProduct: UpdateProductUseCase;
  readonly deleteProduct: DeleteProductUseCase;
  readonly getWhatsAppLink: GetWhatsAppLinkUseCase;
}

/**
 * Orchestrates product use cases.
 * Controllers call exactly one method on this facade.
 */
export class ProductFacade {
  constructor(private readonly deps: ProductFacadeDeps) {}

  list(query: ListProductsQueryDTO): Promise<Result<ListProductsResult, Error>> {
    return this.deps.listProducts.execute(query);
  }

  getById(id: string): Promise<Result<ProductDTO, Error>> {
    return this.deps.getProductById.execute(id);
  }

  create(dto: CreateProductDTO): Promise<Result<ProductDTO, Error>> {
    return this.deps.createProduct.execute(dto);
  }

  update(id: string, dto: UpdateProductDTO): Promise<Result<ProductDTO, Error>> {
    return this.deps.updateProduct.execute(id, dto);
  }

  delete(id: string): Promise<Result<void, Error>> {
    return this.deps.deleteProduct.execute(id);
  }

  whatsAppLink(productId: string): Promise<Result<WhatsAppLinkResult, Error>> {
    return this.deps.getWhatsAppLink.execute(productId);
  }
}
