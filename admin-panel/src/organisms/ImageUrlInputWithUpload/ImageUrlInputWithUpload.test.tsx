/** @vitest-environment happy-dom */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ImageUrlInputWithUpload } from "./ImageUrlInputWithUpload";

vi.mock("@/api/uploads.api", () => ({
  adminUploadImage: vi.fn().mockResolvedValue("/api/v1/uploads/new.jpg"),
}));

describe("ImageUrlInputWithUpload", () => {
  it("shows preview for valid image ref", () => {
    render(
      <ImageUrlInputWithUpload
        id="img"
        label="Image"
        value="/api/v1/uploads/x.jpg"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("img", { name: "Preview" })).toBeInTheDocument();
  });

  it("does not show preview for invalid value", () => {
    render(<ImageUrlInputWithUpload id="img" label="Image" value="not-a-url" onChange={vi.fn()} />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("uploads file and calls onChange with returned URL", async () => {
    const onChange = vi.fn();
    const { container } = render(<ImageUrlInputWithUpload id="img" label="Image" value="" onChange={onChange} />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    const file = new File([new Uint8Array([1])], "a.png", { type: "image/png" });
    fireEvent.change(fileInput as HTMLInputElement, { target: { files: [file] } });
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("/api/v1/uploads/new.jpg"));
  });
});
