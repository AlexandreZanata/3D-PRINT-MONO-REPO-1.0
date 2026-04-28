# API Reference — OpenAPI 3.1

```yaml
openapi: "3.1.0"
info:
  title: 3D Print Shop API
  version: "1.0.0"
  description: |
    E-commerce backend for a 3D print shop.
    All responses use a strict envelope:
      Success: { success: true, data: T, meta?: { page, limit, total } }
      Error:   { success: false, error: { code, message, details? } }

servers:
  - url: http://localhost:3000/api/v1
    description: Local development

security: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    # ── Envelopes ─────────────────────────────────────────────────────────────
    PaginatedMeta:
      type: object
      required: [page, limit, total]
      properties:
        page:  { type: integer, example: 1 }
        limit: { type: integer, example: 20 }
        total: { type: integer, example: 100 }

    ErrorDetail:
      type: object
      required: [code, message]
      properties:
        code:    { type: string, example: "NOT_FOUND" }
        message: { type: string, example: "Product not found" }
        details: {}

    ErrorResponse:
      type: object
      required: [success, error]
      properties:
        success: { type: boolean, enum: [false] }
        error:   { $ref: "#/components/schemas/ErrorDetail" }

    # ── Product ───────────────────────────────────────────────────────────────
    Product:
      type: object
      required: [id, name, description, price, stock, whatsappNumber,
                 imageUrl, isActive, createdAt, updatedAt, deletedAt]
      properties:
        id:             { type: string, format: uuid }
        name:           { type: string, example: "Geometric Vase" }
        description:    { type: string }
        price:          { type: number, format: float, example: 49.99 }
        stock:          { type: integer, example: 10 }
        whatsappNumber: { type: string, example: "+5511999999999" }
        imageUrl:       { type: string, format: uri, nullable: true }
        isActive:       { type: boolean }
        createdAt:      { type: string, format: date-time }
        updatedAt:      { type: string, format: date-time }
        deletedAt:      { type: string, format: date-time, nullable: true }

    CreateProductRequest:
      type: object
      required: [name, description, price, stock, whatsappNumber]
      properties:
        name:           { type: string, minLength: 1, maxLength: 200 }
        description:    { type: string, minLength: 1, maxLength: 2000 }
        price:          { type: number, minimum: 0 }
        stock:          { type: integer, minimum: 0 }
        whatsappNumber: { type: string, pattern: "^\\+?\\d{7,15}$" }
        imageUrl:       { type: string, format: uri, nullable: true }

    UpdateProductRequest:
      type: object
      properties:
        name:           { type: string, minLength: 1, maxLength: 200 }
        description:    { type: string, minLength: 1, maxLength: 2000 }
        price:          { type: number, minimum: 0 }
        stock:          { type: integer, minimum: 0 }
        whatsappNumber: { type: string, pattern: "^\\+?\\d{7,15}$" }
        imageUrl:       { type: string, format: uri, nullable: true }
        isActive:       { type: boolean }

    # ── Auth ──────────────────────────────────────────────────────────────────
    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:    { type: string, format: email }
        password: { type: string, minLength: 8 }

    TokenPair:
      type: object
      required: [accessToken, refreshToken]
      properties:
        accessToken:  { type: string }
        refreshToken: { type: string }

    RefreshRequest:
      type: object
      required: [refreshToken]
      properties:
        refreshToken: { type: string }

    # ── Audit Log ─────────────────────────────────────────────────────────────
    AuditLog:
      type: object
      required: [id, adminId, action, entity, entityId, payload, ip, ua, createdAt]
      properties:
        id:        { type: string, format: uuid }
        adminId:   { type: string, format: uuid }
        action:    { type: string }
        entity:    { type: string }
        entityId:  { type: string }
        payload:   { type: object }
        ip:        { type: string }
        ua:        { type: string }
        createdAt: { type: string, format: date-time }

paths:
  # ── Public: Products ──────────────────────────────────────────────────────
  /products:
    get:
      summary: List products (public)
      description: Returns paginated, filterable product list. Inactive products excluded.
      operationId: listProducts
      parameters:
        - { name: page,      in: query, schema: { type: integer, default: 1 } }
        - { name: limit,     in: query, schema: { type: integer, default: 20, maximum: 100 } }
        - { name: name,      in: query, schema: { type: string } }
        - { name: min_price, in: query, schema: { type: number } }
        - { name: max_price, in: query, schema: { type: number } }
        - { name: is_active, in: query, schema: { type: boolean } }
      responses:
        "200":
          headers:
            X-Total-Count: { schema: { type: integer } }
            X-Page:        { schema: { type: integer } }
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean, enum: [true] }
                  data:
                    type: array
                    items: { $ref: "#/components/schemas/Product" }
                  meta: { $ref: "#/components/schemas/PaginatedMeta" }
        "500": { description: Internal error, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }

  /products/events:
    get:
      summary: SSE stream for real-time product updates
      operationId: productEvents
      responses:
        "200":
          description: SSE stream
          content:
            text/event-stream:
              schema: { type: string }

  /products/{id}:
    get:
      summary: Get product by ID (public)
      operationId: getProduct
      parameters:
        - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean, enum: [true] }
                  data: { $ref: "#/components/schemas/Product" }
        "404": { description: Not found, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }

  /products/{id}/whatsapp:
    get:
      summary: Get WhatsApp deep-link for a product
      operationId: getWhatsAppLink
      parameters:
        - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean, enum: [true] }
                  data:
                    type: object
                    properties:
                      url: { type: string, format: uri, example: "https://wa.me/5511999999999?text=..." }
        "404": { description: Not found, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }

  # ── Auth ──────────────────────────────────────────────────────────────────
  /auth/login:
    post:
      summary: Admin login
      operationId: login
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/LoginRequest" }
            example: { email: "admin@example.com", password: "Admin123!" }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean, enum: [true] }
                  data: { $ref: "#/components/schemas/TokenPair" }
        "401": { description: Invalid credentials, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }

  /auth/refresh:
    post:
      summary: Refresh access token
      operationId: refreshToken
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/RefreshRequest" }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean, enum: [true] }
                  data: { $ref: "#/components/schemas/TokenPair" }
        "401": { description: Invalid token, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }

  /auth/logout:
    post:
      summary: Logout (revoke refresh token family)
      operationId: logout
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/RefreshRequest" }
      responses:
        "204": { description: No content }
        "401": { description: Invalid token, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }

  # ── Admin ─────────────────────────────────────────────────────────────────
  /admin/products:
    get:
      summary: List all products including inactive (admin)
      operationId: adminListProducts
      security:
        - BearerAuth: []
      parameters:
        - { name: page,  in: query, schema: { type: integer, default: 1 } }
        - { name: limit, in: query, schema: { type: integer, default: 20, maximum: 100 } }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean, enum: [true] }
                  data: { type: array, items: { $ref: "#/components/schemas/Product" } }
                  meta: { $ref: "#/components/schemas/PaginatedMeta" }
        "401": { description: Unauthorized, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        "403": { description: Forbidden, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }

    post:
      summary: Create product (admin)
      operationId: adminCreateProduct
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/CreateProductRequest" }
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean, enum: [true] }
                  data: { $ref: "#/components/schemas/Product" }
        "400": { description: Validation error, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        "401": { description: Unauthorized, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }

  /admin/products/{id}:
    put:
      summary: Update product (admin)
      operationId: adminUpdateProduct
      security:
        - BearerAuth: []
      parameters:
        - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/UpdateProductRequest" }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean, enum: [true] }
                  data: { $ref: "#/components/schemas/Product" }
        "400": { description: Validation error, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
        "404": { description: Not found, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }

    delete:
      summary: Soft-delete product (admin)
      operationId: adminDeleteProduct
      security:
        - BearerAuth: []
      parameters:
        - { name: id, in: path, required: true, schema: { type: string, format: uuid } }
      responses:
        "204": { description: No content }
        "404": { description: Not found, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }

  /admin/audit-logs:
    get:
      summary: List audit logs (admin)
      operationId: adminListAuditLogs
      security:
        - BearerAuth: []
      parameters:
        - { name: page,  in: query, schema: { type: integer, default: 1 } }
        - { name: limit, in: query, schema: { type: integer, default: 20, maximum: 100 } }
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean, enum: [true] }
                  data: { type: array, items: { $ref: "#/components/schemas/AuditLog" } }
                  meta: { $ref: "#/components/schemas/PaginatedMeta" }
        "401": { description: Unauthorized, content: { application/json: { schema: { $ref: "#/components/schemas/ErrorResponse" } } } }
```
