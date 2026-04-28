# Components Reference

All atoms and molecules in the Forma frontend.

---

## Atoms (`src/atoms/ui/`)

Atoms are the smallest indivisible UI units. They receive all data via props and emit all actions via callbacks. They contain zero hooks that call the store or API.

All shadcn/ui atoms support `variant` and `size` props via `class-variance-authority`.

### Button

**Purpose:** Primary interactive element. Wraps a `<button>` or any element via `asChild`.

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `default \| destructive \| outline \| secondary \| ghost \| link` | `default` | Visual style |
| `size` | `default \| sm \| lg \| icon` | `default` | Size variant |
| `asChild` | `boolean` | `false` | Render as child element via Radix Slot |
| `disabled` | `boolean` | `false` | Disables interaction |

**Usage:**
```tsx
<Button variant="destructive" size="sm" onClick={handleDelete}>
  Delete
</Button>
```

---

### Input

**Purpose:** Single-line text input. Use inside `FormField` molecule — never standalone.

**Props:** All standard `<input>` HTML attributes.

**Usage:**
```tsx
<Input type="email" placeholder="admin@example.com" {...register("email")} />
```

---

### Badge

**Purpose:** Small status indicator label.

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `default \| secondary \| destructive \| outline` | `default` | Color style |

**Usage:**
```tsx
<Badge variant="secondary">Inactive</Badge>
```

---

### Skeleton

**Purpose:** Loading placeholder that mimics content shape.

**Usage:**
```tsx
<Skeleton className="h-4 w-32" />
```

---

## Molecules (`src/molecules/`)

Molecules compose 2–5 atoms. They are still pure — no API calls, no store access.

### FormField

**Purpose:** Label + Input/Textarea + error message. All form fields must use this component.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Links label to input via `htmlFor`/`id` |
| `label` | `string` | ✅ | Visible label text |
| `error` | `string` | — | Validation error from React Hook Form |
| `as` | `"input" \| "textarea"` | — | Renders textarea when `"textarea"` |
| `inputProps` | `InputHTMLAttributes \| TextareaHTMLAttributes` | — | Forwarded to the input element |

**Usage:**
```tsx
<FormField
  id="email"
  label="Email"
  error={errors.email?.message}
  inputProps={{ ...register("email"), type: "email" }}
/>
```

---

### ProductCard

**Purpose:** Displays a product thumbnail, name, tagline, and price. Links to the product detail page.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `product` | `Product` | ✅ | Product data to display |

**Usage:**
```tsx
<ProductCard product={product} />
```

---

### ProductCarousel

**Purpose:** Scrollable image carousel with prev/next buttons and dot indicators.

**Props:**

| Prop | Type | Required | Description |
|---|---|---|---|
| `images` | `string[]` | ✅ | Array of image URLs |
| `alt` | `string` | ✅ | Alt text base (appended with view number) |
| `className` | `string` | — | Additional CSS classes |
| `rounded` | `boolean` | — | Apply rounded corners (default: true) |
| `priority` | `boolean` | — | Eager-load first image |
