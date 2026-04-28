import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("should render label and input", () => {
    render(<FormField id="email" label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should display error message when error prop is provided", () => {
    render(<FormField id="email" label="Email" error="Invalid email" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("should not display error message when error is undefined", () => {
    render(<FormField id="email" label="Email" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid", "true");
  });

  it("should render textarea when as='textarea'", () => {
    render(<FormField id="desc" label="Description" as="textarea" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    // textarea has role="textbox" too
    const el = screen.getByLabelText("Description");
    expect(el.tagName.toLowerCase()).toBe("textarea");
  });

  it("should call onChange when user types", async () => {
    const onChange = vi.fn();
    render(
      <FormField id="name" label="Name" inputProps={{ onChange }} />,
    );
    await userEvent.type(screen.getByRole("textbox"), "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("should associate label with input via htmlFor/id", () => {
    render(<FormField id="test-field" label="Test" />);
    const label = screen.getByText("Test");
    expect(label).toHaveAttribute("for", "test-field");
  });
});
