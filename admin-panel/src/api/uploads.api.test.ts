import { beforeEach, describe, expect, it, vi } from "vitest";

const post = vi.fn();

vi.mock("./httpClient", () => ({
  httpClient: { post },
}));

describe("adminUploadImage", () => {
  beforeEach(() => {
    post.mockReset();
  });

  it("returns public URL on success", async () => {
    post.mockResolvedValue({
      data: { success: true, data: { url: "/api/v1/uploads/a.jpg" } },
    });
    const { adminUploadImage } = await import("./uploads.api");
    const file = new File([new Uint8Array([1, 2, 3])], "x.png", { type: "image/png" });
    await expect(adminUploadImage(file)).resolves.toBe("/api/v1/uploads/a.jpg");
    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0]?.[1]).toBeInstanceOf(FormData);
  });

  it("throws when response is not success", async () => {
    post.mockResolvedValue({
      data: { success: false, data: { url: "" } },
    });
    const { adminUploadImage } = await import("./uploads.api");
    const file = new File([], "x.png", { type: "image/png" });
    await expect(adminUploadImage(file)).rejects.toThrow("Upload failed");
  });

  it("propagates network errors", async () => {
    post.mockRejectedValue(new Error("offline"));
    const { adminUploadImage } = await import("./uploads.api");
    const file = new File([], "x.png", { type: "image/png" });
    await expect(adminUploadImage(file)).rejects.toThrow("offline");
  });
});
