import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("should render with default size and accessible label", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByLabelText("Loading…")).toBeInTheDocument();
  });

  it("should apply sm size class", () => {
    render(<Spinner size="sm" />);
    expect(screen.getByRole("status")).toHaveClass("h-4");
  });

  it("should apply lg size class", () => {
    render(<Spinner size="lg" />);
    expect(screen.getByRole("status")).toHaveClass("h-10");
  });

  it("should use custom label for accessibility", () => {
    render(<Spinner label="Saving changes…" />);
    expect(screen.getByLabelText("Saving changes…")).toBeInTheDocument();
  });
});
