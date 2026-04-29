/* eslint-disable */
// @ts-nocheck

import { Route as rootRouteImport } from './routes/__root'
import { Route as LoginRouteImport } from './routes/login'
import { Route as AdminRouteImport } from './routes/_admin'
import { Route as AdminProductsRouteImport } from './routes/_admin.products'
import { Route as AdminProductsNewRouteImport } from './routes/_admin.products.new'
import { Route as AdminProductsIdEditRouteImport } from './routes/_admin.products.$id.edit'
import { Route as AdminSiteSettingsRouteImport } from './routes/_admin.site-settings'
import { Route as AdminAuditLogsRouteImport } from './routes/_admin.audit-logs'

const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminRoute = AdminRouteImport.update({
  id: '/_admin',
  getParentRoute: () => rootRouteImport,
} as any)

const AdminProductsRoute = AdminProductsRouteImport.update({
  id: '/products',
  path: '/products',
  getParentRoute: () => AdminRoute,
} as any)

const AdminProductsNewRoute = AdminProductsNewRouteImport.update({
  id: '/new',
  path: '/new',
  getParentRoute: () => AdminProductsRoute,
} as any)

const AdminProductsIdEditRoute = AdminProductsIdEditRouteImport.update({
  id: '/$id/edit',
  path: '/$id/edit',
  getParentRoute: () => AdminProductsRoute,
} as any)

const AdminSiteSettingsRoute = AdminSiteSettingsRouteImport.update({
  id: '/site-settings',
  path: '/site-settings',
  getParentRoute: () => AdminRoute,
} as any)

const AdminAuditLogsRoute = AdminAuditLogsRouteImport.update({
  id: '/audit-logs',
  path: '/audit-logs',
  getParentRoute: () => AdminRoute,
} as any)

export interface FileRoutesByFullPath {
  '/login': typeof LoginRoute
  '/products': typeof AdminProductsRouteWithChildren
  '/products/new': typeof AdminProductsNewRoute
  '/products/$id/edit': typeof AdminProductsIdEditRoute
  '/site-settings': typeof AdminSiteSettingsRoute
  '/audit-logs': typeof AdminAuditLogsRoute
}
export interface FileRoutesByTo {
  '/login': typeof LoginRoute
  '/products': typeof AdminProductsRouteWithChildren
  '/products/new': typeof AdminProductsNewRoute
  '/products/$id/edit': typeof AdminProductsIdEditRoute
  '/site-settings': typeof AdminSiteSettingsRoute
  '/audit-logs': typeof AdminAuditLogsRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/login': typeof LoginRoute
  '/_admin': typeof AdminRouteWithChildren
  '/_admin/products': typeof AdminProductsRouteWithChildren
  '/_admin/products/new': typeof AdminProductsNewRoute
  '/_admin/products/$id/edit': typeof AdminProductsIdEditRoute
  '/_admin/site-settings': typeof AdminSiteSettingsRoute
  '/_admin/audit-logs': typeof AdminAuditLogsRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/login'
    | '/products'
    | '/products/new'
    | '/products/$id/edit'
    | '/site-settings'
    | '/audit-logs'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/login'
    | '/products'
    | '/products/new'
    | '/products/$id/edit'
    | '/site-settings'
    | '/audit-logs'
  id:
    | '__root__'
    | '/login'
    | '/_admin'
    | '/_admin/products'
    | '/_admin/products/new'
    | '/_admin/products/$id/edit'
    | '/_admin/site-settings'
    | '/_admin/audit-logs'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  LoginRoute: typeof LoginRoute
  AdminRoute: typeof AdminRouteWithChildren
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_admin': {
      id: '/_admin'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AdminRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_admin/products': {
      id: '/_admin/products'
      path: '/products'
      fullPath: '/products'
      preLoaderRoute: typeof AdminProductsRouteImport
      parentRoute: typeof AdminRoute
    }
    '/_admin/products/new': {
      id: '/_admin/products/new'
      path: '/new'
      fullPath: '/products/new'
      preLoaderRoute: typeof AdminProductsNewRouteImport
      parentRoute: typeof AdminProductsRoute
    }
    '/_admin/products/$id/edit': {
      id: '/_admin/products/$id/edit'
      path: '/$id/edit'
      fullPath: '/products/$id/edit'
      preLoaderRoute: typeof AdminProductsIdEditRouteImport
      parentRoute: typeof AdminProductsRoute
    }
    '/_admin/site-settings': {
      id: '/_admin/site-settings'
      path: '/site-settings'
      fullPath: '/site-settings'
      preLoaderRoute: typeof AdminSiteSettingsRouteImport
      parentRoute: typeof AdminRoute
    }
    '/_admin/audit-logs': {
      id: '/_admin/audit-logs'
      path: '/audit-logs'
      fullPath: '/audit-logs'
      preLoaderRoute: typeof AdminAuditLogsRouteImport
      parentRoute: typeof AdminRoute
    }
  }
}

interface AdminProductsRouteChildren {
  AdminProductsNewRoute: typeof AdminProductsNewRoute
  AdminProductsIdEditRoute: typeof AdminProductsIdEditRoute
}
const AdminProductsRouteChildren: AdminProductsRouteChildren = {
  AdminProductsNewRoute,
  AdminProductsIdEditRoute,
}
const AdminProductsRouteWithChildren = AdminProductsRoute._addFileChildren(AdminProductsRouteChildren)

interface AdminRouteChildren {
  AdminProductsRoute: typeof AdminProductsRouteWithChildren
  AdminSiteSettingsRoute: typeof AdminSiteSettingsRoute
  AdminAuditLogsRoute: typeof AdminAuditLogsRoute
}
const AdminRouteChildren: AdminRouteChildren = {
  AdminProductsRoute: AdminProductsRouteWithChildren,
  AdminSiteSettingsRoute,
  AdminAuditLogsRoute,
}
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren)

const rootRouteChildren: RootRouteChildren = {
  LoginRoute,
  AdminRoute: AdminRouteWithChildren,
}

export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
