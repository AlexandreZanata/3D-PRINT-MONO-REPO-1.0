/**
 * FormField molecule — usage examples (non-rendered documentation file).
 * This file is not imported anywhere — it exists for documentation only.
 */
import { FormField } from "./FormField";

// Basic input field
export const BasicInput = () => (
  <FormField id="email" label="Email" inputProps={{ type: "email", placeholder: "you@example.com" }} />
);

// Field with validation error
export const WithError = () => (
  <FormField
    id="password"
    label="Password"
    error="Password must be at least 8 characters"
    inputProps={{ type: "password" }}
  />
);

// Textarea variant
export const TextareaVariant = () => (
  <FormField
    id="description"
    label="Description"
    as="textarea"
    inputProps={{ rows: 4, placeholder: "Describe the product…" }}
  />
);
