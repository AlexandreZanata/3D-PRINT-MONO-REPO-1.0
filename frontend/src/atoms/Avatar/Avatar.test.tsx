import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
  it("should render initials when no src is provided", () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("should render single initial for single-word name", () => {
    render(<Avatar name="Admin" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("should render image when src is provided", () => {
    render(<Avatar name="John Doe" src="https://example.com/avatar.jpg" />);
    expect(screen.getByRole("img", { name: "John Doe" })).toBeInTheDocument();
  });

  it("should apply sm size class", () => {
    render(<Avatar name="AB" size="sm" />);
    expect(screen.getByLabelText("AB")).toHaveClass("h-7");
  });

  it("should apply lg size class", () => {
    render(<Avatar name="AB" size="lg" />);
    expect(screen.getByLabelText("AB")).toHaveClass("h-12");
  });

  it("should handle empty name gracefully", () => {
    render(<Avatar name="" />);
    // Should render without crashing
    expect(screen.getByLabelText("")).toBeInTheDocument();
  });
});
