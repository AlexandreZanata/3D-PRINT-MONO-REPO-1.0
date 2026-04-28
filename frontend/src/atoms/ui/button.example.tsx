/**
 * Button atom — usage examples (non-rendered documentation file).
 * This file is not imported anywhere — it exists for documentation only.
 */
import { Button } from "./button";

// All variants
export const AllVariants = () => (
  <div className="flex gap-2 flex-wrap">
    <Button variant="default">Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>
);

// All sizes
export const AllSizes = () => (
  <div className="flex items-center gap-2">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
  </div>
);

// Disabled state
export const Disabled = () => <Button disabled>Cannot click</Button>;
