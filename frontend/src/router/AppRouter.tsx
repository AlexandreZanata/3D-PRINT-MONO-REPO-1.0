/**
 * AppRouter — documents the intended route structure.
 *
 * This project uses TanStack Router (file-based routing via src/routes/).
 * The routes below are defined as TanStack file routes, not React Router routes.
 * This file serves as the canonical route map reference.
 *
 * Route map:
 *   /                         → src/routes/index.tsx        (public)
 *   /shop                     → src/routes/shop.tsx         (public)
 *   /product/:slug            → src/routes/product.$slug.tsx (public)
 *   /cart                     → src/routes/cart.tsx         (public)
 *   /checkout                 → src/routes/checkout.tsx     (public)
 *   /login                    → src/routes/login.tsx        (auth)
 *   /admin                    → redirect to /admin/products
 *   /admin/products           → src/routes/admin/products.tsx   (AdminRoute)
 *   /admin/products/new       → src/routes/admin/products.new.tsx (AdminRoute)
 *   /admin/products/:id/edit  → src/routes/admin/products.$id.edit.tsx (AdminRoute)
 *   /admin/audit-logs         → src/routes/admin/audit-logs.tsx (AdminRoute)
 *   *                         → 404 (handled by __root.tsx notFoundComponent)
 *
 * Guards are implemented as TanStack Router beforeLoad hooks in each admin route.
 * See ProtectedRoute.tsx and AdminRoute.tsx for the React Router equivalents.
 */
export {};
